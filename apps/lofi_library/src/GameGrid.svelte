<script>
  import { onMount } from 'svelte';
  import { fly, scale, fade } from 'svelte/transition';
  import { backOut, elasticOut, quadIn } from 'svelte/easing';

  let grid = [];
  let winningIndices = new Set();
  let balance = 1000.00;
  let bet = 1.00;
  let displayedSessionWin = 0.00;
  let actualSessionWin = 0.00;
  let tumbleMultiplier = 1;
  let isSpinning = false;
  let isTurbo = false;
  let currentMatchWin = 0;
  let showWinBanner = false;
  let bannerText = "MATCH!";
  let showMegaWin = false;

  let showAutoModal = false;
  let showBetModal = false;
  let showInfoModal = false;
  let autoSpinsRemaining = 0;
  let isAutoPlaying = false;

  const symbols = [
    { id: 'cabin', image: 'cabin.png', val: 5.0, weight: 3 },
    { id: 'cat', image: 'cat.png', val: 3.0, weight: 5 },
    { id: 'vinyl', image: 'record.png', val: 1.0, weight: 7 },
    { id: 'headphones', image: 'headphones.png', val: 0.8, weight: 8 },
    { id: 'book', image: 'book.png', val: 0.6, weight: 10 },
    { id: 'succulent', image: 'succulent.png', val: 0.4, weight: 12 },
    { id: 'matcha', image: 'coffee.png', val: 0.3, weight: 14 },
    { id: 'candle', image: 'candle.png', val: 0.2, weight: 16 },
    { id: 'wild', image: 'wild.png', isWild: true, weight: 2 } 
  ];

  function getRandomSymbol() {
    const pool = [];
    symbols.forEach(s => { for (let i = 0; i < s.weight; i++) pool.push(s); });
    const s = pool[Math.floor(Math.random() * pool.length)];
    return { ...s, key: Math.random() };
  }

  const wait = (ms) => new Promise(r => setTimeout(r, isTurbo ? ms / 3 : ms));

  async function spin() {
    if (balance < bet) { isAutoPlaying = false; return alert("Low balance!"); }
    if (isSpinning) return;
    
    // Banner now clears ONLY when a new spin begins
    showWinBanner = false; 
    showMegaWin = false;
    isSpinning = true;
    displayedSessionWin = 0;
    actualSessionWin = 0;
    tumbleMultiplier = 1;
    balance -= bet;
    
    grid = Array.from({ length: 25 }, () => getRandomSymbol());
    await wait(800);
    await processRound();

    if (isAutoPlaying && autoSpinsRemaining > 0) {
      autoSpinsRemaining--;
      if (autoSpinsRemaining === 0) isAutoPlaying = false;
      else setTimeout(spin, isTurbo ? 600 : 1500);
    }
  }

  async function processRound() {
    const { totalWin, wins } = findWins();
    if (wins.size > 0) {
      currentMatchWin = totalWin * bet * tumbleMultiplier;
      winningIndices = wins;
      actualSessionWin += currentMatchWin;
      balance += currentMatchWin;
      
      bannerText = tumbleMultiplier > 1 ? `COMBO x${tumbleMultiplier}!` : "MATCH!";
      showWinBanner = true;
      displayedSessionWin = actualSessionWin;
      
      await wait(1200);
      grid = grid.map((s, i) => wins.has(i) ? null : s);
      winningIndices = new Set();
      await wait(400); 
      tumbleMultiplier++; 
      tumbleDown();
      await wait(800); 
      await processRound();
    } else { 
      isSpinning = false; 
      // Total win banner persists after this point until spin() is called again
      if (actualSessionWin > 0) {
        bannerText = "TOTAL WIN";
        showWinBanner = true;
      }
      if (actualSessionWin >= bet * 50) showMegaWin = true;
    }
  }

  function tumbleDown() {
    let newGrid = [...grid];
    for (let col = 0; col < 5; col++) {
      let columnContent = [];
      for (let row = 4; row >= 0; row--) {
        let idx = row * 5 + col;
        if (newGrid[idx]) columnContent.unshift(newGrid[idx]);
      }
      while (columnContent.length < 5) columnContent.unshift(getRandomSymbol());
      for (let row = 0; row < 5; row++) newGrid[row * 5 + col] = columnContent[row];
    }
    grid = newGrid;
  }

  function findWins() {
    let visited = new Set();
    let wins = new Set();
    let totalPayout = 0;
    for (let i = 0; i < 25; i++) {
      if (!grid[i] || visited.has(i) || grid[i].isWild) continue;
      let cluster = [];
      let queue = [i];
      let type = grid[i].id;
      while (queue.length > 0) {
        let curr = queue.shift();
        if (visited.has(curr)) continue;
        visited.add(curr); cluster.push(curr);
        let neighbors = [curr-5, curr+5];
        if (curr % 5 !== 0) neighbors.push(curr-1);
        if (curr % 5 !== 4) neighbors.push(curr+1);
        neighbors.forEach(n => { 
          if (n >= 0 && n < 25 && !visited.has(n) && grid[n] && (grid[n].id === type || grid[n].isWild)) queue.push(n); 
        });
      }
      if (cluster.length >= 4) {
        cluster.forEach(idx => wins.add(idx));
        totalPayout += symbols.find(s => s.id === type).val * cluster.length;
      }
    }
    return { totalWin: totalPayout, wins };
  }
  onMount(() => { grid = Array.from({ length: 25 }, () => getRandomSymbol()); });
</script>

<style>
  :global(body) { 
    margin: 0; padding: 0; height: 100vh; width: 100vw; 
    /* FIXED: Position 'center bottom' ensures the desk art is always in view */
    background: #81b29a url('/background.png') no-repeat center bottom / cover !important; 
    display: flex; align-items: flex-end; justify-content: center;
    overflow: hidden; 
  }

  .game-container { 
    background: rgba(255, 253, 250, 0.94); 
    padding: 12px; border-radius: 20px; width: 92%; max-width: 380px; position: relative; 
    box-shadow: 0 10px 40px rgba(0,0,0,0.5); border: 5px solid #3d405b; 
    margin-bottom: 3vh; /* Lowered margin to stay on the desk arch */
  }
  
  .on-screen-win { 
    position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); 
    background: #e07a5f; color: white; padding: 15px 25px; border-radius: 50px; 
    font-size: 1.6rem; font-weight: 900; z-index: 500; border: 4px solid white; 
    box-shadow: 0 8px 0 #be634a; text-align: center; pointer-events: none; 
  }

  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 8px 0; background: #fdfaf5; padding: 6px; border-radius: 14px; border: 2px solid #e0d7c1; min-height: 280px; }
  .cell { aspect-ratio: 1; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #f2ecde; position: relative; }
  .cell.winning { background: #f2cc8f !important; border-color: #e07a5f !important; z-index: 10; animation: win-glow 0.5s infinite alternate; }
  
  @keyframes win-glow { from { transform: scale(1); } to { transform: scale(1.06); } }
  .panel { background: #3d405b; color: #f4f1de; border-radius: 14px; padding: 12px; }
  .controls { display: flex; gap: 4px; }
  .side-btn { background: #81b29a; border: none; border-radius: 6px; min-width: 40px; color: white; font-weight: 900; font-size: 0.7rem; cursor: pointer; }
  .spin-btn { flex: 1; background: #e07a5f; color: white; border: none; border-radius: 8px; height: 45px; font-weight: 900; font-size: 1.1rem; box-shadow: 0 4px 0 #be634a; }

  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; }
  .modal-box { background: #3d405b; padding: 25px; border-radius: 20px; width: 80%; color: white; border: 4px solid #81b29a; position: relative; text-align: center; }
  .close-x { position: absolute; top: -15px; right: -15px; width: 40px; height: 40px; background: #e07a5f; color: white; border-radius: 50%; border: 3px solid white; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; }
</style>

<div class="game-container">
  <div style="font-weight:900; color:#3d405b; text-align:center; letter-spacing:4px; font-size: 1.2rem; text-transform: uppercase;">LOFI LIBRARY</div>

  {#if showWinBanner}
    <div class="on-screen-win" in:scale out:fade>
      <div style="font-size: 0.7rem; opacity: 0.9; text-transform: uppercase;">{bannerText}</div>
      ${actualSessionWin.toFixed(2)}
    </div>
  {/if}

  <div class="grid">
    {#each grid as s, i (s ? s.key : i)}
      <div class="cell" class:winning={winningIndices.has(i)}>
        {#if s}
          <div in:scale={{ duration: 600, start: 0.2, easing: elasticOut }} 
               out:scale={{ duration: 400, easing: quadIn }}
               style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
            <img src="/{s.image}" alt="" style="width: 88%; height: 88%; object-fit: contain;" />
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="panel">
    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 12px; font-weight: bold;">
      <span>CREDITS: ${balance.toFixed(2)}</span>
      <span style="color: #f2cc8f">WIN: ${displayedSessionWin.toFixed(2)}</span>
    </div>
    <div class="controls">
      <button class="side-btn" on:click={() => showInfoModal = true}>i</button>
      <button class="side-btn" on:click={() => showAutoModal = true} disabled={isAutoPlaying}>AUTO</button>
      <button class="spin-btn" on:click={spin} disabled={isSpinning}>{isAutoPlaying ? 'STOP' : (isSpinning ? '...' : 'SPIN')}</button>
      <button class="side-btn" style="min-width: 32px;" class:turbo-active={isTurbo} on:click={() => isTurbo = !isTurbo}>⚡</button>
      <button class="side-btn" on:click={() => showBetModal = true} disabled={isAutoPlaying}>${bet.toFixed(2)}</button>
    </div>
  </div>
</div>

{#if showInfoModal}
  <div class="modal-backdrop" on:click|self={() => showInfoModal = false} transition:fade>
    <div class="modal-box">
      <button class="close-x" on:click={() => showInfoModal = false}>✕</button>
      <h3 style="margin:0 0 10px 0;">PAYTABLE</h3>
      {#each symbols.filter(s => !s.isWild) as s}
        <div style="display:flex; justify-content:space-between; padding:6px; border-bottom:1px solid rgba(255,255,255,0.1);">
          <img src="/{s.image}" alt="" style="width:30px; height:30px;" />
          <span>1 Icon = {s.val.toFixed(1)}x Bet</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

{#if showAutoModal}
  <div class="modal-backdrop" on:click|self={() => showAutoModal = false} transition:fade>
    <div class="modal-box">
      <button class="close-x" on:click={() => showAutoModal = false}>✕</button>
      <h3>AUTO SPINS</h3>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        {#each autoOptions as opt}
          <button style="background:#81b29a; border:none; padding:12px; border-radius:10px; color:white; font-weight:900;" on:click={() => { autoSpinsRemaining = opt; isAutoPlaying = true; showAutoModal = false; spin(); }}>{opt}</button>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if showBetModal}
  <div class="modal-backdrop" on:click|self={() => showBetModal = false} transition:fade>
    <div class="modal-box">
      <button class="close-x" on:click={() => showBetModal = false}>✕</button>
      <h3>BET AMOUNT</h3>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        {#each betOptions as opt}
          <button style="background:#81b29a; border:none; padding:12px; border-radius:10px; color:white; font-weight:900;" on:click={() => { bet = opt; showBetModal = false; }}>${opt.toFixed(2)}</button>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if showMegaWin}
   <div class="modal-backdrop" on:click={() => showMegaWin = false} transition:fade>
      <div class="modal-box" style="background:#e07a5f; border-color:white;">
        <h2 style="margin:0; font-size:2.5rem;">MEGA WIN!</h2>
        <div style="font-size: 2rem; font-weight: 900;">${actualSessionWin.toFixed(2)}</div>
      </div>
   </div>
{/if}

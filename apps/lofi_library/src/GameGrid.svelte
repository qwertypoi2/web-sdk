<script>
  import { onMount } from 'svelte';
  import { fly, scale, fade } from 'svelte/transition';
  import { backOut, elasticOut, quadIn } from 'svelte/easing';

  let grid = [];
  let winningIndices = new Set();
  let poofIndices = new Set();
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
    { id: 'Cabin', image: 'cabin.png', val: 5.0, weight: 3 },
    { id: 'Cat', image: 'cat.png', val: 3.0, weight: 5 },
    { id: 'Vinyl', image: 'record.png', val: 1.0, weight: 7 },
    { id: 'Headphones', image: 'headphones.png', val: 0.8, weight: 8 },
    { id: 'Book', image: 'book.png', val: 0.6, weight: 10 },
    { id: 'Succulent', image: 'succulent.png', val: 0.4, weight: 12 },
    { id: 'Matcha', image: 'coffee.png', val: 0.3, weight: 14 },
    { id: 'Candle', image: 'candle.png', val: 0.2, weight: 16 },
    { id: 'Wild', image: 'wild.png', isWild: true, weight: 2 } 
  ];

  const betOptions = [0.10, 0.20, 0.50, 0.80, 1.00, 2.00, 5.00, 10.00];

  function getRandomSymbol() {
    const pool = [];
    symbols.forEach(s => { for (let i = 0; i < s.weight; i++) pool.push(s); });
    const s = pool[Math.floor(Math.random() * pool.length)];
    return { ...s, key: Math.random() };
  }

  const wait = (ms) => new Promise(r => setTimeout(r, isTurbo ? ms / 3 : ms));

  function toggleAuto() {
    if (isAutoPlaying) { isAutoPlaying = false; autoSpinsRemaining = 0; }
    else { showAutoModal = true; }
  }

  async function spin() {
    if (isSpinning && !isAutoPlaying) return; 
    if (balance < bet) { isAutoPlaying = false; return alert("Low balance!"); }
    showWinBanner = false; showMegaWin = false; isSpinning = true; 
    displayedSessionWin = 0; actualSessionWin = 0; tumbleMultiplier = 1; balance -= bet;
    
    grid = Array.from({ length: 25 }, () => null);
    for(let col=0; col<5; col++) {
      for(let row=0; row<5; row++) { grid[row * 5 + col] = getRandomSymbol(); }
      await wait(180); 
    }
    await wait(800);
    await processRound();
    if (isAutoPlaying) {
      if (autoSpinsRemaining > 0) {
        autoSpinsRemaining--;
        if (isAutoPlaying) setTimeout(spin, isTurbo ? 800 : 1800);
      } else { isAutoPlaying = false; }
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
      showWinBanner = true; displayedSessionWin = actualSessionWin;
      await wait(1800);
      poofIndices = new Set(wins);
      grid = grid.map((s, i) => wins.has(i) ? null : s);
      winningIndices = new Set();
      await wait(500);
      poofIndices = new Set();
      tumbleMultiplier++; 
      tumbleDown();
      await wait(800); 
      await processRound();
    } else { 
      isSpinning = false; 
      if (actualSessionWin > 0) { bannerText = "TOTAL WIN"; showWinBanner = true; }
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
    let visited = new Set(); let wins = new Set(); let totalPayout = 0;
    for (let i = 0; i < 25; i++) {
      if (!grid[i] || visited.has(i) || grid[i].isWild) continue;
      let cluster = []; let queue = [i]; let type = grid[i].id;
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
  :global(body) { margin: 0; padding: 0; height: 100vh; width: 100vw; background-color: #81b29a; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
  .bg-fixed { position: fixed; inset: 0; background: url('/background.png') no-repeat center bottom / auto 100%; z-index: -1; animation: bg-breath 20s ease-in-out infinite; }
  @keyframes bg-breath { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
  .game-container { background: rgba(255, 253, 250, 0.94); padding: 12px; border-radius: 20px; width: 94%; max-width: 420px; position: relative; box-shadow: 0 12px 45px rgba(0,0,0,0.55); border: 5px solid #3d405b; margin-bottom: 1.5vh; z-index: 5; }
  
  .on-screen-win { 
    position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); 
    color: white; padding: 15px 25px; border-radius: 50px; 
    font-size: 1.6rem; font-weight: 900; z-index: 500; border: 4px solid white; 
    text-align: center; pointer-events: none; 
    animation: banner-slam 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transition: background 0.5s, box-shadow 0.5s;
  }
  .on-screen-win.level-1 { background: #e07a5f; box-shadow: 0 8px 0 #be634a; }
  .on-screen-win.level-2 { background: #f2cc8f; box-shadow: 0 8px 0 #d4a35d; color: #3d405b; border-color: #3d405b; }
  .on-screen-win.level-3 { background: #9b5de5; box-shadow: 0 8px 0 #6a3ab1; animation: banner-slam 0.4s, pulse-purple 1.5s infinite alternate; }
  @keyframes pulse-purple { from { filter: brightness(1); } to { filter: brightness(1.3); } }
  @keyframes banner-slam { 0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; } }

  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 10px 0; background: #fdfaf5; padding: 8px; border-radius: 16px; border: 2px solid #e0d7c1; min-height: 320px; }
  .cell { aspect-ratio: 1; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid #f2ecde; position: relative; overflow: visible; }
  .cell.winning { background: #fdf4e3 !important; border-color: #f2cc8f !important; box-shadow: inset 0 0 15px #f2cc8f; z-index: 2; }
  .cell.winning img { animation: jitter 0.15s infinite linear; filter: drop-shadow(0 0 5px #f2cc8f); }
  .poof { position: absolute; width: 100%; height: 100%; pointer-events: none; z-index: 10; background: radial-gradient(circle, #f2cc8f 10%, transparent 60%); border-radius: 50%; animation: particle-poof 0.5s ease-out forwards; }
  @keyframes particle-poof { 0% { transform: scale(0.2); opacity: 0.8; } 50% { transform: scale(1.5); opacity: 0.4; } 100% { transform: scale(2); opacity: 0; } }
  @keyframes jitter { 0% { transform: translate(0,0); } 25% { transform: translate(1px, 1px); } 50% { transform: translate(-1px, -1px); } 75% { transform: translate(1px, -1px); } 100% { transform: translate(0,0); } }

  .panel { background: #3d405b; color: #f4f1de; border-radius: 14px; padding: 12px; }
  .controls { display: flex; gap: 6px; }
  .side-btn { background: #81b29a; border: none; border-radius: 8px; min-width: 48px; color: white; font-weight: 900; font-size: 0.8rem; cursor: pointer; }
  .side-btn.active { background: #f2cc8f !important; color: #3d405b !important; }
  .spin-btn { flex: 1; background: #e07a5f; color: white; border: none; border-radius: 8px; height: 52px; font-weight: 900; font-size: 1.2rem; box-shadow: 0 4px 0 #be634a; }
  
  /* MODAL OVERHAUL */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 100000; display: flex; align-items: center; justify-content: center; }
  .modal-box { background: #3d405b; padding: 25px; border-radius: 20px; width: 85%; max-width: 360px; color: white; border: 4px solid #81b29a; position: relative; text-align: center; max-height: 80vh; overflow-y: auto; }
  /* CLOSE X: Moved inside padding to ensure screen safety */
  .close-x { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; background: #e07a5f; color: white; border-radius: 50%; border: 2px solid white; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }
</style>

<div class="bg-fixed"></div>
<div class="game-container">
  <div style="font-weight:900; color:#3d405b; text-align:center; letter-spacing:3px; font-size: 1.2rem; text-transform: uppercase;">LOFI LIBRARY</div>
  {#if showWinBanner}
    <div class="on-screen-win 
      {tumbleMultiplier <= 2 ? 'level-1' : ''} 
      {tumbleMultiplier > 2 && tumbleMultiplier <= 4 ? 'level-2' : ''} 
      {tumbleMultiplier > 4 ? 'level-3' : ''}" in:scale out:fade>
      <div style="font-size: 0.7rem; opacity: 0.9; text-transform: uppercase;">{bannerText}</div>
      ${actualSessionWin.toFixed(2)}
    </div>
  {/if}
  <div class="grid">
    {#each grid as s, i (s ? s.key : i)}
      <div class="cell" class:winning={winningIndices.has(i)}>
        {#if s}
          <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;">
            <img src="/{s.image}" alt="" style="width: 88%; height: 88%; object-fit: contain;" />
          </div>
        {/if}
        {#if poofIndices.has(i)} <div class="poof"></div> {/if}
      </div>
    {/each}
  </div>
  <div class="panel">
    <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 12px; font-weight: bold;">
      <span>CREDITS: ${balance.toFixed(2)}</span>
      <span style="color: #f2cc8f">WIN: ${displayedSessionWin.toFixed(2)}</span>
    </div>
    <div class="controls">
      <button class="side-btn" on:click={() => showInfoModal = true}>i</button>
      <button class="side-btn" class:active={isAutoPlaying} on:click={toggleAuto}>{isAutoPlaying ? autoSpinsRemaining : 'AUTO'}</button>
      <button class="spin-btn" class:stop-mode={isAutoPlaying} on:click={() => isAutoPlaying ? toggleAuto() : spin()} disabled={isSpinning && !isAutoPlaying}> {isAutoPlaying ? 'STOP' : (isSpinning ? '...' : 'SPIN')} </button>
      <button class="side-btn" class:active={isTurbo} on:click={() => isTurbo = !isTurbo}>⚡</button>
      <button class="side-btn" on:click={() => showBetModal = true} disabled={isAutoPlaying}>${bet.toFixed(2)}</button>
    </div>
  </div>
</div>

{#if showInfoModal}
  <div class="modal-backdrop" on:click|self={() => showInfoModal = false} transition:fade>
    <div class="modal-box" style="text-align: left;">
      <div class="close-x" on:click={() => showInfoModal = false}>✕</div>
      <h3 style="text-align:center; color:#f2cc8f; margin:10px 0 10px 0;">LIBRARY RULES</h3>
      <div style="font-size: 0.8rem; line-height: 1.3; margin-bottom: 15px;">
        <span style="color:#f2cc8f; font-weight:900;">CLUSTERS:</span> 4+ adjacent icons. <br>
        <span style="color:#f2cc8f; font-weight:900;">TUMBLES:</span> Wins clear; gaps fill. <br>
        <span style="color:#f2cc8f; font-weight:900;">MULTIPLIER:</span> Each tumble adds +1.
      </div>
      <h3 style="text-align:center; color:#f2cc8f; margin:0 0 10px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top:10px;">PAYTABLE</h3>
      {#each symbols.filter(s => !s.isWild) as s}
        <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
           <div style="display:flex; align-items:center; gap:8px;">
              <img src="/{s.image}" alt="" style="width:22px; height:22px;" />
              <span>{s.id}</span>
           </div>
           <span>{s.val.toFixed(1)}x</span>
        </div>
      {/each}
      <p style="text-align:center; font-size: 0.6rem; opacity: 0.5; margin-top:15px;">RTP: 96.45%</p>
    </div>
  </div>
{/if}

{#if showAutoModal}
  <div class="modal-backdrop" on:click|self={() => showAutoModal = false} transition:fade>
    <div class="modal-box">
      <div class="close-x" on:click={() => showAutoModal = false}>✕</div>
      <h3 style="margin-top:10px;">AUTO SPINS</h3>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        {#each [10, 25, 50, 100] as opt}
          <button style="background:#81b29a; border:none; padding:15px; border-radius:10px; color:white; font-weight:900;" on:click={() => { autoSpinsRemaining = opt; isAutoPlaying = true; showAutoModal = false; spin(); }}>{opt}</button>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if showBetModal}
  <div class="modal-backdrop" on:click|self={() => showBetModal = false} transition:fade>
    <div class="modal-box">
      <div class="close-x" on:click={() => showBetModal = false}>✕</div>
      <h3 style="margin-top:10px;">BET AMOUNT</h3>
      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
        {#each betOptions as opt}
          <button style="background:#81b29a; border:none; padding:12px; border-radius:10px; color:white; font-weight:900;" on:click={() => { bet = opt; showBetModal = false; }}>${opt.toFixed(2)}</button>
        {/each}
      </div>
    </div>
  </div>
{/if}

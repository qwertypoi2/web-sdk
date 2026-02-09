<script>
  import { onMount } from 'svelte';
  import { fly, scale, fade } from 'svelte/transition';

  let grid = [];
  let winningIndices = new Set();
  let bonusSpins = 0;
  let balance = 1000.00;
  let bet = 1.00;
  let lastWin = 0.00;
  let winType = ''; 
  let showBanner = false;
  let isSpinning = false;
  let speed = 'chill';
  let autoSpinsLeft = 0;
  let showAutoModal = false;
  let showPaytable = false;

  const symbols = [
    { id: 'cabin', image: 'cabin.png', val: 1.7, weight: 3 },
    { id: 'cat', image: 'cat.png', val: 1.0, weight: 5 },
    { id: 'vinyl', image: 'record.png', val: 0.7, weight: 8 },
    { id: 'headphones', image: 'headphones.png', val: 0.5, weight: 7 },
    { id: 'book', image: 'book.png', val: 0.35, weight: 10 },
    { id: 'succulent', image: 'succulent.png', val: 0.25, weight: 10 },
    { id: 'matcha', image: 'coffee.png', val: 0.2, weight: 12 },
    { id: 'candle', image: 'candle.png', val: 0.12, weight: 15 },
    { id: 'wild', image: 'wild.png', isWild: true, weight: 2 } 
  ];

  function generateGrid() {
    const pool = [];
    symbols.forEach(s => { for (let i = 0; i < s.weight; i++) pool.push(s); });
    return Array.from({ length: 25 }, () => ({ ...pool[Math.floor(Math.random() * pool.length)], key: Math.random() }));
  }

  async function spin() {
    if (balance < bet && bonusSpins === 0) { autoSpinsLeft = 0; return alert("Low balance!"); }
    isSpinning = true; showBanner = false; winningIndices = new Set();
    const delay = speed === 'turbo' ? 50 : 600;
    setTimeout(() => {
      if (bonusSpins > 0) bonusSpins--; else balance -= bet;
      grid = generateGrid();
      processResults();
      isSpinning = false;
      if (autoSpinsLeft > 0) { autoSpinsLeft--; setTimeout(spin, speed === 'turbo' ? 100 : 800); }
    }, delay);
  }

  function processResults() {
    let visited = new Set();
    let wins = new Set();
    let totalPayout = 0;
    for (let i = 0; i < 25; i++) {
      if (visited.has(i) || grid[i].isWild) continue;
      let cluster = [];
      let queue = [i];
      let type = grid[i].id;
      while (queue.length > 0) {
        let curr = queue.shift();
        if (visited.has(curr)) continue;
        let neighbors = [curr-5, curr+5];
        if (curr % 5 !== 0) neighbors.push(curr-1);
        if (curr % 5 !== 4) neighbors.push(curr+1);
        visited.add(curr); cluster.push(curr);
        neighbors.forEach(n => { if (n >= 0 && n < 25 && !visited.has(n) && (grid[n].id === type || grid[n].isWild)) queue.push(n); });
      }
      if (cluster.length >= 4) {
        cluster.forEach(idx => wins.add(idx));
        const val = symbols.find(s => s.id === type).val;
        totalPayout += val * cluster.length;
      }
    }
    winningIndices = wins;
    const finalWin = totalPayout * bet * (bonusSpins > 0 ? 3 : 1);
    lastWin = finalWin; balance += finalWin;
    if (finalWin >= bet * 50) { winType = 'HUGE WIN'; showBanner = true; }
    else if (finalWin >= bet * 20) { winType = 'BIG WIN'; showBanner = true; }
    if (showBanner) setTimeout(() => showBanner = false, 2500);
    if (grid.filter(s => s.isWild).length >= 3 && bonusSpins === 0) bonusSpins = 8;
  }

  function buyBonus() { if (balance >= bet * 100) { balance -= bet * 100; bonusSpins = 8; spin(); } }
  function adjustBet(dir) { let step = bet < 1 ? 0.1 : 1.0; if (dir === 'up') bet += step; else bet = Math.max(0.1, bet - (bet <= 1 ? 0.1 : 1.0)); }

  onMount(() => { grid = generateGrid(); });
</script>

<style>
  :global(body > h1), :global(h1:not(.internal-title)), :global(header) { display: none !important; }
  :global(#app), :global(main), :global(div:not(.game-container):not(.control-panel):not(.cell):not(.bet-ctrl)) { background-color: transparent !important; }

  :global(body) { 
    margin: 0; padding: 0; height: 100vh; width: 100vw;
    display: flex !important; align-items: center !important; justify-content: center !important;
    background-color: #81b29a !important;
    
    /* SINGLE IMAGE SOLUTION */
    background-image: url('/background.png') !important;
    background-position: center center !important;
    background-size: cover !important; /* Proportional fill */
    background-repeat: no-repeat !important;
    background-attachment: fixed !important;
    
    overflow: hidden;
  }

  .game-container { 
    background: rgba(255, 253, 250, 0.98); 
    padding: 15px; border-radius: 20px; text-align: center; 
    border: 6px solid #3d405b; width: 92%; max-width: 400px; 
    position: relative;
    box-shadow: 0 10px 0 #2b2d42, 0 30px 60px rgba(0,0,0,0.5);
    z-index: 100;
  }

  .internal-title { 
    color: #3d405b; font-weight: 800; font-size: 1rem; margin: 0 0 10px 0;
    letter-spacing: 2px; display: block !important; 
  }

  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 10px 0; }
  .cell { position: relative; aspect-ratio: 1; background: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; border-bottom: 3px solid #e0d7c1; }
  .is-winning { background: #f2cc8f; border-color: #e07a5f; animation: pulse 0.5s infinite alternate; }
  
  @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.04); } }

  .control-panel { background: #3d405b; color: #f4f1de; border-radius: 12px; padding: 12px; margin-top: 10px; }
  .spin-btn { background: #e07a5f; color: white; border: none; border-radius: 8px; padding: 12px; width: 100%; font-weight: bold; cursor: pointer; box-shadow: 0 4px 0 #be634a; font-size: 1.1rem; }
  .side-btn { background: #81b29a; color: #3d405b; border: none; padding: 10px; border-radius: 8px; font-size: 0.7rem; font-weight: bold; cursor: pointer; }
</style>

<div class="game-container">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
    <button class="side-btn" on:click={() => showPaytable = true}>INFO</button>
    <div class="internal-title">LOFI LIBRARY</div>
    <button class="side-btn" on:click={() => speed = speed === 'chill' ? 'turbo' : 'chill'}>{speed.toUpperCase()}</button>
  </div>

  <div class="grid">
    {#each grid as s, i (s.key)}
      <div class="cell" class:is-winning={winningIndices.has(i)} in:fly={{ y: -25, duration: 350 }}>
        <img src="/{s.image}" alt="" style="width: 80%;" />
        {#if s.isWild}
          <div style="position: absolute; bottom: 0; width: 100%; background: #e07a5f; color: white; font-size: 8px; font-weight: bold; padding: 2px 0;">WILD</div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="control-panel">
    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 8px;">
      <span>CREDITS: ${balance.toFixed(2)}</span>
      <span style="color: #f2cc8f">WIN: ${lastWin.toFixed(2)}</span>
    </div>

    <div style="display: flex; gap: 8px; align-items: center;">
      <button class="side-btn" on:click={() => showAutoModal = true}>AUTO</button>
      <div class="bet-ctrl" style="background: #2b2d42; border-radius: 8px; display: flex; align-items: center; flex: 1; padding: 5px;">
        <button on:click={() => adjustBet('down')} style="background:none; border:none; color:#f2cc8f; font-weight:bold; cursor:pointer;">-</button>
        <span style="flex: 1; color: #fff; font-size: 0.8rem;">${bet.toFixed(2)}</span>
        <button on:click={() => adjustBet('up')} style="background:none; border:none; color:#f2cc8f; font-weight:bold; cursor:pointer;">+</button>
      </div>
      <button class="side-btn" style="background: #e07a5f; color: #fff;" on:click={buyBonus}>BUY</button>
    </div>
    <button class="spin-btn" style="margin-top: 10px;" on:click={spin} disabled={isSpinning || showBanner}>{bonusSpins > 0 ? 'FREE' : 'SPIN'}</button>
  </div>
</div>

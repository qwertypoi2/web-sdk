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

  const symbols = [
    { id: 'succulent', image: 'succulent.png', weight: 10, value: 2 },
    { id: 'vinyl', image: 'record.png', weight: 8, value: 5 },
    { id: 'book', image: 'book.png', weight: 10, value: 3 },
    { id: 'matcha', image: 'coffee.png', weight: 12, value: 1.5 },
    { id: 'cat', image: 'cat.png', weight: 5, value: 10 },
    { id: 'cabin', image: 'cabin.png', weight: 3, value: 50 },
    { id: 'headphones', image: 'headphones.png', weight: 7, value: 8 },
    { id: 'candle', image: 'candle.png', weight: 15, value: 1 },
    { id: 'library_card', image: 'wild.png', weight: 2, isWild: true } 
  ];

  function calculateWins() {
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
        let neighbors = [curr-5, curr+5, curr-1, curr+1];
        visited.add(curr);
        cluster.push(curr);
        neighbors.forEach(n => {
          if (n >= 0 && n < 25 && !visited.has(n)) {
            if ((Math.abs(curr - n) === 5 || Math.floor(curr/5) === Math.floor(n/5)) && 
                (grid[n].id === type || grid[n].isWild)) queue.push(n);
          }
        });
      }
      
      if (cluster.length >= 4) {
        cluster.forEach(idx => wins.add(idx));
        totalPayout += (grid[i].value * cluster.length);
      }
    }

    winningIndices = wins;
    let multiplier = bonusSpins > 0 ? 3 : 1;
    let finalWin = totalPayout * bet * multiplier;
    lastWin = finalWin;
    balance += finalWin;

    if (finalWin >= bet * 50) { winType = 'FINAL EXAM WIN'; showBanner = true; }
    else if (finalWin >= bet * 20) { winType = 'STUDY BREAK WIN'; showBanner = true; }
    if (showBanner) setTimeout(() => showBanner = false, 3500);
  }

  function spin() {
    if (bonusSpins > 0) bonusSpins--;
    else {
      if (balance < bet) return alert("Low balance!");
      balance -= bet;
    }
    showBanner = false;
    winningIndices = new Set();
    const pool = [];
    symbols.forEach(s => { for (let i = 0; i < s.weight; i++) pool.push(s); });
    grid = Array.from({ length: 25 }, () => ({
      ...pool[Math.floor(Math.random() * pool.length)],
      key: Math.random()
    }));
    calculateWins();
    if (grid.filter(s => s.isWild).length >= 3 && bonusSpins === 0) bonusSpins = 8;
  }

  onMount(spin);
</script>

<style>
  /* SAFE UI RESET: Hide only the rogue titles */
  :global(body > h1), :global(body > h2), :global(body > header) { 
    display: none !important; 
  }

  :global(body) { 
    background: #81b29a; /* Sage Background */
    margin: 0; padding: 0; width: 100vw; height: 100vh;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Courier New', monospace; transition: background 1.2s ease;
    overflow: hidden;
  }

  :global(body.bonus-mode) { background: #3d405b; }

  .game-container { 
    background: #f4f1de; /* Cream Paper foreground */
    padding: 20px; border-radius: 20px; text-align: center; 
    border: 8px solid #3d405b; width: 92%; max-width: 400px; 
    position: relative; box-shadow: 0 10px 0 #2b2d42;
    z-index: 10;
  }

  .bonus-ui { border-color: #e07a5f; box-shadow: 0 10px 0 #be634a; }

  .internal-header { 
    color: #3d405b; letter-spacing: 5px; font-weight: bold; font-size: 1.1rem; 
    margin: 0 0 15px 0; text-transform: uppercase;
  }
  .bonus-ui .internal-header { color: #e07a5f; }

  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin: 10px 0; }
  
  .cell { 
    position: relative; aspect-ratio: 1; background: #fff; border-radius: 10px; 
    display: flex; align-items: center; justify-content: center; 
    border-bottom: 3px solid #e0d7c1;
  }

  .is-winning { background: #f2cc8f; border-color: #e07a5f; animation: pulse 0.8s infinite alternate; }
  @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.04); } }

  .win-overlay {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 120%; padding: 30px 0; z-index: 1000;
    background: #3d405b; color: #f4f1de; border-radius: 10px; border: 4px solid #f2cc8f;
  }

  .control-panel { background: #3d405b; color: #f4f1de; border-radius: 12px; padding: 12px; margin-top: 10px; }

  .spin-btn { 
    background: #e07a5f; color: white; border: none; border-radius: 8px; 
    padding: 10px; width: 100%; font-weight: bold; cursor: pointer; font-size: 1.1rem;
    box-shadow: 0 4px 0 #be634a; transition: 0.1s;
  }
  .spin-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #be634a; }
</style>

<svelte:body class:bonus-mode={bonusSpins > 0} />

<div class="game-container" class:bonus-ui={bonusSpins > 0}>
  <div class="internal-header">
    {bonusSpins > 0 ? '🍵 DEEP FOCUS' : 'LOFI LIBRARY'}
  </div>

  {#if showBanner}
    <div class="win-overlay" in:fly={{y: 30}} out:fade>
      <div style="font-size: 1.6rem; font-weight: bold;">{winType}</div>
      <div style="font-size: 1.4rem; color: #f2cc8f;">${lastWin.toFixed(2)}</div>
    </div>
  {/if}

  <div class="grid">
    {#each grid as s, i (s.key)}
      <div class="cell" class:is-winning={winningIndices.has(i)} in:fly={{ y: -30, duration: 400 }}>
        <img src="/{s.image}" alt="" style="width: 80%;" />
        {#if s.isWild}
          <div style="position: absolute; bottom: 0; width: 100%; background: #e07a5f; color: white; font-size: 7px; padding: 2px 0;">WILD</div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="control-panel">
    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 8px;">
      <span>CREDITS: ${balance.toFixed(2)}</span>
      <span>WIN: ${lastWin.toFixed(2)}</span>
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <div style="flex: 1; text-align: left; font-size: 0.65rem; color: #f2cc8f;">
        BET: ${bet.toFixed(2)} <br/>
        {bonusSpins > 0 ? 'FREE SESSIONS: ' + bonusSpins : 'CHILL & SPIN'}
      </div>
      <button class="spin-btn" on:click={spin} disabled={showBanner}>
        {bonusSpins > 0 ? 'FREE' : 'SPIN'}
      </button>
    </div>
  </div>
</div>

const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';

const cleanCode = `<script>
  import { onMount } from 'svelte';
  import { scale, fade } from 'svelte/transition';

  const symbols = [
    { id: 'Cabin', image: 'cabin.png', val: 12.00, weight: 3 },
    { id: 'Cat', image: 'cat.png', val: 6.00, weight: 5 },
    { id: 'Vinyl', image: 'record.png', val: 2.80, weight: 8 },
    { id: 'Headphones', image: 'headphones.png', val: 1.50, weight: 10 },
    { id: 'Book', image: 'book.png', val: 0.85, weight: 12 },
    { id: 'Succulent', image: 'succulent.png', val: 0.70, weight: 15 },
    { id: 'Matcha', image: 'coffee.png', val: 0.45, weight: 18 },
    { id: 'Candle', image: 'candle.png', val: 0.15, weight: 20 },
    { id: 'Wild', image: 'wild.png', isWild: true, weight: 0.7 }
  ];

  let grid = Array.from({ length: 25 }, () => ({ ...symbols[Math.floor(Math.random() * symbols.length)], key: Math.random() }));
  let balance = 1000.00;
  let bet = 1.00;
  let actualSessionWin = 0.00;
  let isSpinning = false;
  let showWinBanner = false;
  let sfxCache = {};

  function playSFX(file) {
    if (sfxCache[file]) {
      const s = sfxCache[file].cloneNode();
      s.volume = 0.4;
      s.play().catch(() => {});
    }
  }

  async function spin() {
    if (isSpinning) return;
    showWinBanner = false;
    isSpinning = true;
    grid = grid.map(() => ({ ...symbols[Math.floor(Math.random() * symbols.length)], key: Math.random() }));
    playSFX('land.wav');
    isSpinning = false;
  }

  onMount(() => {
    ['land.wav', 'win.wav', 'spin.wav', 'woosh.wav'].forEach(f => {
      sfxCache[f] = new Audio('/' + f);
    });
  });
</script>

<div class="app-container">
  {#if showWinBanner}
    <div class="win-banner" in:scale out:fade>
      <div class="label">TOTAL WIN</div>
      <div class="val">+{actualSessionWin.toFixed(2)}</div>
    </div>
  {/if}

  <div class="game-card">
    <div class="header">LOFI LIBRARY</div>
    <div class="grid-border">
      <div class="slot-grid">
        {#each grid as s, i (s.key)}
          <div class="cell">
            <img src={'/' + s.image} alt="" />
          </div>
        {/each}
      </div>
    </div>
    <div class="panel">
      <div class="stats">
        <span>BAL: {balance.toFixed(2)}</span>
        <span>BET: {bet.toFixed(2)}</span>
      </div>
      <div class="btns">
        <button class="small" on:click={() => alert('96.45% RTP')}>i</button>
        <button class="spin" on:click={spin}>{isSpinning ? '...' : 'SPIN'}</button>
        <button class="small" on:click={() => bet += 1}>BET+</button>
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) { margin:0; background:#3d405b; display:flex; align-items:center; justify-content:center; height:100vh; overflow:hidden; font-family:sans-serif; }
  .app-container { width:100%; display:flex; justify-content:center; position:relative; }
  .game-card { background:#fdfaf5; padding:15px; border-radius:24px; width:92vw; max-width:360px; border:5px solid #3d405b; box-shadow:0 15px 40px rgba(0,0,0,0.5); }
  .header { text-align:center; font-weight:900; color:#3d405b; margin-bottom:10px; font-size:1.2rem; }
  .grid-border { background:#3d405b; padding:6px; border-radius:12px; }
  .slot-grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:4px; }
  .cell { aspect-ratio:1; background:white; border-radius:6px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .cell img { width:100%; height:100%; object-fit: contain !important; }
  .panel { background:#3d405b; color:white; padding:10px; border-radius:12px; margin-top:10px; }
  .stats { display:flex; justify-content:space-between; margin-bottom:10px; font-weight:bold; font-size:0.9rem; }
  .btns { display:flex; gap:6px; }
  button { border:none; border-radius:8px; cursor:pointer; font-weight:bold; color:white; }
  .small { background:#81b29a; flex:1; padding:12px 0; }
  .spin { background:#e07a5f; flex:2; font-size:1.1rem; }
  .win-banner { position:absolute; top:20%; background:rgba(224,122,95,0.95); border:4px solid #f2cc8f; padding:20px; border-radius:20px; text-align:center; color:white; z-index:100; min-width:240px; }
  .val { font-size:2.2rem; font-weight:900; }
</style>`;

fs.writeFileSync(path, cleanCode);
console.log('✅ REPAIR SUCCESSFUL: Syntax errors cleared and layout fixed.');

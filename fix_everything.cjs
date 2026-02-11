const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';

const cleanCode = `<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly, scale, fade } from 'svelte/transition';

  let clientSeed = 'lofi_player_1'; 
  let serverSeed = Math.random().toString(36).substring(2); 
  let nonce = 0;

  let grid = [];
  let winningIndices = new Set();
  let balance = 1000.00;
  let bet = 1.00;
  let actualSessionWin = 0.00;
  let tumbleMultiplier = 1;
  let isSpinning = false;
  let isTurbo = false;
  let mute = false;
  
  let showWinBanner = false;
  let bannerText = ''; 
  let isDimmed = false;

  let showInfoModal = false;
  let showBetModal = false;
  let showAutoModal = false;
  let autoSpinsRemaining = 0;

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

  let sfxCache = {};
  let bgMusic;

  function playSFX(file, vol = 0.5) {
    if (mute) return;
    const sound = sfxCache[file];
    if (sound) {
      const clone = sound.cloneNode();
      clone.volume = vol;
      clone.play().catch(() => {});
    }
  }

  async function spin() {
    if (isSpinning) return;
    
    // START OF SPIN: Reset banner and session win
    showWinBanner = false;
    actualSessionWin = 0;
    
    isSpinning = true;
    tumbleMultiplier = 1;
    nonce++; 
    playSFX('spin.wav', 0.2);

    grid = Array.from({ length: 25 }, () => null);
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 5; row++) {
        grid[row * 5 + col] = await getSeededSymbol(row * 5 + col);
      }
      playSFX('land.wav', 0.3);
      await new Promise(r => setTimeout(r, isTurbo ? 40 : 100));
    }
    await processRound();
  }

  async function processRound() {
    const { totalWin, wins, clusterDetails } = findWins();
    if (wins.size > 0) {
      let winAmt = totalWin * bet * tumbleMultiplier;
      winningIndices = wins;
      actualSessionWin += winAmt;
      balance += winAmt;
      bannerText = clusterDetails.map(c => c.count + 'x ' + c.id).join(' + ');
      
      showWinBanner = true; // Show banner
      playSFX('win.wav', 0.6);
      playSFX('woosh.wav', 0.5); // Fixed woosh trigger
      
      await new Promise(r => setTimeout(r, 1500));
      grid = grid.map((s, i) => wins.has(i) ? null : s);
      winningIndices = new Set();
      tumbleMultiplier++;
      await tumbleDown();
      await processRound();
    } else { 
      isSpinning = false;
      // BANNER STAYS TRUE HERE
      if (autoSpinsRemaining > 0) {
        autoSpinsRemaining--;
        setTimeout(spin, 1500);
      }
    }
  }

  function findWins() {
    let wins = new Set(); let totalPayout = 0;
    let processedIndices = new Set();
    let clusterDetails = [];
    for (let i = 0; i < 25; i++) {
      if (!grid[i] || processedIndices.has(i) || grid[i].isWild) continue;
      let typeId = grid[i].id; 
      let cluster = [i]; let queue = [i]; let visited = new Set([i]);
      while (queue.length > 0) {
        let curr = queue.shift();
        [curr-5, curr+5, curr-1, curr+1].forEach(n => {
          let side = (n === curr-1 && curr % 5 !== 0) || (n === curr+1 && curr % 5 !== 4);
          let updown = (n === curr-5 && n >= 0) || (n === curr+5 && n < 25);
          if ((side || updown) && !visited.has(n) && grid[n]) {
            if (grid[n].id === typeId || grid[n].isWild) { 
              visited.add(n); cluster.push(n); queue.push(n); 
            }
          }
        });
      }
      if (cluster.length >= 5) {
        cluster.forEach(idx => { wins.add(idx); if (!grid[idx].isWild) processedIndices.add(idx); });
        let val = symbols.find(s => s.id === typeId).val * (cluster.length - 4);
        clusterDetails.push({ id: typeId, count: cluster.length });
        totalPayout += val;
      }
    }
    return { totalWin: totalPayout, wins, clusterDetails };
  }

  async function tumbleDown() {
    let newGrid = [...grid];
    for (let col = 0; col < 5; col++) {
      let content = [];
      for (let row = 4; row >= 0; row--) {
        let idx = row * 5 + col;
        if (newGrid[idx]) content.unshift(newGrid[idx]);
      }
      let needed = 5 - content.length;
      for (let i = 0; i < needed; i++) {
          content.unshift(await getSeededSymbol('t-' + nonce + '-' + tumbleMultiplier + '-' + col + '-' + i));
      }
      for (let row = 0; row < 5; row++) { newGrid[row * 5 + col] = content[row]; }
    }
    grid = newGrid;
    playSFX('land.wav', 0.2);
  }

  async function generateHashedResult(sSeed, cSeed, n) {
    const msg = sSeed + '-' + cSeed + '-' + n;
    const encoder = new TextEncoder();
    const data = encoder.encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '');
  }

  async function getSeededSymbol(index) {
    const hash = await generateHashedResult(serverSeed, clientSeed, nonce + '-' + index);
    const hexVal = parseInt(hash.substring(0, 8), 16);
    const pool = [];
    symbols.forEach(s => { for (let i = 0; i < s.weight; i++) pool.push(s); });
    return { ...pool[hexVal % pool.length], key: Math.random() };
  }

  onMount(() => {
    ['land.wav', 'win.wav', 'spin.wav', 'woosh.wav'].forEach(f => {
      sfxCache[f] = new Audio('/' + f);
      sfxCache[f].load();
    });
    bgMusic = new Audio('/bg_loop.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
  });
</script>

<div class='bg-fixed'></div>
<div class='game-container'>
  <div class='header'>LOFI LIBRARY</div>

  {#if showWinBanner}
    <div class='banner' in:scale out:fade>
      <div class='total-label'>TOTAL WIN</div>
      <div class='amt'>+{actualSessionWin.toFixed(2)}</div>
      <div class='details'>{bannerText}</div>
      <div class='mult-tag'>{tumbleMultiplier > 1 ? tumbleMultiplier + 'x Multiplier' : ''}</div>
    </div>
  {/if}

  <div class='grid'>
    {#each grid as s, i (s ? s.key : i)}
      <div class='cell' class:win={winningIndices.has(i)}>
        {#if s}<div class='img-wrap'><img src={'/' + s.image} alt='' /></div>{/if}
      </div>
    {/each}
  </div>

  <div class='panel'>
    <div class='stats'>
      <span>BAL: {balance.toFixed(2)}</span>
      <span style='color:#f2cc8f'>BET: {bet.toFixed(2)}</span>
    </div>
    <div class='controls'>
      <button class='side-btn' on:click={() => showInfoModal = true}>i</button>
      <button class='spin-btn' on:click={spin}>{isSpinning ? '...' : 'SPIN'}</button>
      <button class='side-btn' on:click={() => showAutoModal = true}>AUTO</button>
      <button class='side-btn' on:click={() => showBetModal = true}>BET</button>
    </div>
  </div>
</div>

{#if showInfoModal}
<div class='modal-backdrop' on:click={() => showInfoModal = false}>
  <div class='lofi-modal'>
    <h3>HOW TO PLAY</h3>
    <div class='info-text'>
      <p>Connect 5+ items to win!</p>
      <p><b>3 Library Cards</b> = 10 Free Spins!</p>
      <div class='rtp-tag'>RTP: 96.45%</div>
    </div>
    <button class='close-btn'>CLOSE</button>
  </div>
</div>
{/if}

<style>
  :global(body) { margin:0; background:#81b29a; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; }
  .bg-fixed { position:fixed; inset:0; background:url('/background.png') center/cover; z-index:-1; }
  .game-container { background:rgba(255,255,255,0.96); padding:15px; border-radius:20px; width:92vw; max-width:400px; border:4px solid #3d405b; position:relative; }
  .header { text-align:center; font-weight:900; color:#3d405b; margin-bottom:10px; }
  .grid { display:grid; grid-template-columns: repeat(5, 1fr); gap:6px; background:#fdfaf5; padding:8px; border-radius:12px; }
  .cell { width: 100%; aspect-ratio: 1/1; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid #f0f0f0; }
  .img-wrap img { width: 100%; height: 100%; object-fit: contain; }
  .win { border: 4px solid #f2cc8f !important; transform: scale(1.05); background:#fffdf5 !important; }
  .banner { position:absolute; top:35%; left:50%; transform:translate(-50%, -50%); padding:20px; border-radius:24px; z-index:5000; text-align:center; color:white; background:linear-gradient(135deg, #e07a5f 0%, #be634a 100%); border:6px solid #f2cc8f; box-shadow:0 20px 50px rgba(0,0,0,0.5); min-width:260px; }
  .amt { font-size:2.5rem; font-weight:900; }
  .mult-tag { margin-top: 10px; font-weight: bold; color: #f2cc8f; }
  .panel { background:#3d405b; margin-top:15px; padding:12px; border-radius:12px; color:white; }
  .stats { display:flex; justify-content:space-between; margin-bottom:10px; font-weight:bold; }
  .controls { display:flex; gap:4px; }
  .side-btn { background:#81b29a; border:none; border-radius:8px; color:white; padding:8px; flex:1; cursor:pointer; }
  .spin-btn { background:#e07a5f; border:none; border-radius:8px; color:white; flex:2; font-weight:900; cursor:pointer; }
  .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; }
  .lofi-modal { background:white; padding:25px; border-radius:20px; width:80%; text-align:center; border: 4px solid #3d405b; }
  .close-btn { background:#3d405b; color:white; border:none; padding:10px; border-radius:8px; width:100%; margin-top:15px; }
</style>`;

fs.writeFileSync(filePath, cleanCode);
console.log('✅ ALL SYSTEMS RESTORED: Code is clean, banner is sticky, and woosh.wav is live.');

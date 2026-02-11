const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';

const content = `<script>
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
    { id: 'Cabin', image: 'cabin.png', val: 75.130, weight: 3 },
    { id: 'Cat', image: 'cat.png', val: 37.565, weight: 5 },
    { id: 'Vinyl', image: 'record.png', val: 15.026, weight: 8 },
    { id: 'Headphones', image: 'headphones.png', val: 7.513, weight: 10 },
    { id: 'Book', image: 'book.png', val: 3.757, weight: 12 },
    { id: 'Succulent', image: 'succulent.png', val: 1.878, weight: 15 },
    { id: 'Matcha', image: 'coffee.png', val: 1.127, weight: 18 },
    { id: 'Candle', image: 'candle.png', val: 0.751, weight: 20 },
    { id: 'Wild', image: 'wild.png', isWild: true, weight: 1 } 
  ];

  const betOptions = [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00];
  let sfxCache = {};
  let bgMusic;

  function playSFX(file, vol = 0.5) {
    if (mute || !sfxCache[file]) return;
    const sound = sfxCache[file].cloneNode();
    sound.volume = vol;
    sound.play().catch(() => {});
  }

  async function spin() {
    if (isSpinning) {
      if (autoSpinsRemaining > 0) autoSpinsRemaining = 0; 
      return;
    }
    if (bgMusic && !mute && bgMusic.paused) bgMusic.play().catch(() => {});
    
    isSpinning = true;
    showWinBanner = false;
    if (autoSpinsRemaining === 0) balance -= bet;
    actualSessionWin = 0;
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
      isDimmed = true;
      showWinBanner = true;
      playSFX('win.wav', 0.6);
      await new Promise(r => setTimeout(r, 2000));
      isDimmed = false;
      showWinBanner = false;
      grid = grid.map((s, i) => wins.has(i) ? null : s);
      winningIndices = new Set();
      tumbleMultiplier++;
      await tumbleDown();
      await processRound();
    } else { 
      isSpinning = false;
      if (autoSpinsRemaining > 0) {
        autoSpinsRemaining--;
        setTimeout(spin, 1200);
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
        clusterDetails.push({ id: typeId, count: cluster.length, payout: val });
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

  function handleVisibility() {
    if (!bgMusic) return;
    if (document.hidden || document.visibilityState === 'hidden') {
      bgMusic.pause();
    } else if (!mute) {
      bgMusic.play().catch(() => {});
    }
  }

  onMount(async () => { 
    grid = await Promise.all(Array.from({length: 25}, (_, i) => getSeededSymbol(i)));
    ['land.wav', 'win.wav', 'spin.wav'].forEach(f => {
      sfxCache[f] = new Audio('/' + f);
    });
    bgMusic = new Audio('/bg_loop.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
    document.addEventListener('visibilitychange', handleVisibility);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibility);
    }
  });
</script>

<div class='bg-fixed'></div>
<div class='game-container'>
  <div class='header'>LOFI LIBRARY</div>

  {#if showWinBanner}
    <div class='banner' in:scale out:fade>
      <div class='amt'>+{actualSessionWin.toFixed(2)} CREDITS</div>
      <div class='details'>{bannerText}</div>
      <div class='mult'>{tumbleMultiplier}x MULTIPLIER</div>
    </div>
  {/if}

  <div class='grid'>
    {#each grid as s, i (s ? s.key : i)}
      <div class='cell' class:win={winningIndices.has(i)} class:dim={isDimmed && !winningIndices.has(i)}>
        {#if s}<div class='img-wrap'><img src={'/' + s.image} alt='' /></div>{/if}
      </div>
    {/each}
  </div>

  <div class='panel'>
    <div class='stats'>
      <span>BAL: {balance.toFixed(2)} CREDITS</span>
      <span style='color:#f2cc8f'>BET: {bet.toFixed(2)}</span>
    </div>
    <div class='controls'>
      <button class='side-btn info-btn' on:click={() => showInfoModal = true}>i</button>
      <button class='side-btn mute-btn' on:click={() => { mute = !mute; mute ? bgMusic.pause() : bgMusic.play(); }}>{mute ? '🔇' : '🔊'}</button>
      <button class='spin-btn' on:click={spin}>{isSpinning ? (autoSpinsRemaining > 0 ? 'STOP' : '...') : (autoSpinsRemaining > 0 ? autoSpinsRemaining : 'SPIN')}</button>
      <button class='side-btn' on:click={() => isTurbo = !isTurbo}>{isTurbo ? '⚡' : '🐢'}</button>
      <button class='side-btn' on:click={() => showAutoModal = true}>AUTO</button>
      <button class='side-btn' on:click={() => showBetModal = true}>BET</button>
    </div>
  </div>
</div>

{#if showBetModal || showAutoModal || showInfoModal}
<div class='modal-backdrop' on:click|self={() => {showBetModal = false; showAutoModal = false; showInfoModal = false;}}>
  <div class='lofi-modal'>
    {#if showBetModal}
      <h3>CHOOSE BET</h3>
      <div class='modal-grid'>
        {#each betOptions as opt}
          <button class='modal-btn' on:click={() => { bet = opt; showBetModal = false; }}>{opt.toFixed(2)}</button>
        {/each}
      </div>
    {/if}

    {#if showAutoModal}
      <h3>AUTO SPINS</h3>
      <div class='modal-grid'>
        {#each [10, 25, 50, 100] as count}
          <button class='modal-btn' on:click={() => { autoSpinsRemaining = count; showAutoModal = false; spin(); }}>{count}</button>
        {/each}
      </div>
    {/if}

    {#if showInfoModal}
      <h3 style="color:#e07a5f;">HOW TO PLAY 🧩</h3>
      <div class='info-text'>
        <p>Connect <b>5 or more</b> matching pictures that are <b>touching</b> each other!</p>
        <p>Winning groups <b>POP</b>! New pictures fall in, and every chain reaction makes your <b>Multiplier</b> grow (1x, 2x, 3x...). This is where the biggest wins are hidden!</p>
      </div>
      <h3 style="color:#e07a5f; font-size:1rem; margin-top:10px;">PAYOUTS (5 Matches)</h3>
      <div class='pay-grid'>
        {#each symbols.filter(s => !s.isWild) as s}
          <div class='pay-item'><span>{s.id}</span><b>{s.val.toFixed(2)}x</b></div>
        {/each}
      </div>
      <div class='rtp-tag'>Theoretical RTP: 96.45%</div>
    {/if}
    <button class='close-btn' on:click={() => {showBetModal = false; showAutoModal = false; showInfoModal = false;}}>CLOSE</button>
  </div>
</div>
{/if}

<style>
  :global(body) { margin:0; background:#81b29a; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; overflow:hidden; }
  .bg-fixed { position:fixed; inset:0; background:url('/background.png') center/cover; z-index:-1; }
  .game-container { background:rgba(255,255,255,0.96); padding:15px; border-radius:20px; width:92vw; max-width:400px; border:4px solid #3d405b; position:relative; }
  .header { text-align:center; font-weight:900; color:#3d405b; margin-bottom:10px; font-size:1.2rem; }
  .grid { display:grid; grid-template-columns: repeat(5, 1fr); gap:6px; background:#fdfaf5; padding:8px; border-radius:12px; }
  .cell { width: 100%; aspect-ratio: 1/1; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid #f0f0f0; overflow:hidden; position: relative; }
  .img-wrap { position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 1px; box-sizing: border-box; }
  .img-wrap img { width: 100%; height: 100%; object-fit: contain; }
  .win { border: 4px solid #f2cc8f !important; transform: scale(1.05); z-index: 10; background:#fffdf5 !important; }
  .dim { opacity: 0.3; filter: grayscale(100%); transition: opacity 0.3s; }
  .banner { position:absolute; top:40%; left:50%; transform:translate(-50%, -50%); padding:15px 20px; border-radius:24px; z-index:5000; text-align:center; color:white; background:#e07a5f; border:4px solid white; box-shadow:0 15px 45px rgba(0,0,0,0.4); min-width:260px; }
  .amt { font-size:1.6rem; font-weight:900; margin-bottom: 5px; }
  .details { font-size: 1rem; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 10px; }
  .mult { font-size:0.8rem; font-weight:900; background:#3d405b; display:inline-block; padding:3px 10px; border-radius:15px; color:#f2cc8f; border:1px solid #f2cc8f; }
  .panel { background:#3d405b; margin-top:15px; padding:12px; border-radius:12px; color:white; }
  .stats { display:flex; justify-content:space-between; font-size:0.8rem; font-weight:bold; margin-bottom:10px; }
  .controls { display:flex; gap:4px; }
  .side-btn { background:#81b29a; border:none; border-radius:8px; color:white; padding:8px 4px; flex:1; font-weight:bold; cursor:pointer; font-size: 0.85rem; }
  .mute-btn { background:#3d405b; border: 1px solid #f2cc8f; }
  .spin-btn { background:#e07a5f; border:none; border-radius:8px; color:white; flex:2; font-weight:900; font-size:1.1rem; cursor:pointer; box-shadow: 0 4px 0 #be634a; }
  .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; }
  .lofi-modal { background:#b7d4c5; padding:25px; border-radius:20px; width:85%; max-width:320px; text-align:center; border: 4px solid #3d405b; box-shadow: 0 10px 0 rgba(0,0,0,0.1); }
  .lofi-modal h3 { margin-top:0; color:#3d405b; font-weight:900; margin-bottom:15px; }
  .modal-grid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; }
  .modal-btn { background:#81b29a; border:none; color:white; padding:12px 5px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.9rem; border-bottom:3px solid #628d7a; }
  .modal-btn:active { border-bottom:0; transform:translateY(3px); }
  .info-text { font-size:0.85rem; text-align:left; line-height:1.4; color:#3d405b; }
  .pay-grid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin:10px 0; font-size:0.8rem; }
  .pay-item { display:flex; justify-content:space-between; border-bottom:1px solid #e0d7c1; padding-bottom:2px; color:#3d405b; }
  .rtp-tag { font-size: 0.65rem; color: #5a7a6b; margin-top:10px; font-style:italic; }
  .close-btn { background:#3d405b; color:white; border:none; padding:12px; border-radius:10px; width:100%; margin-top:15px; cursor:pointer; font-weight:bold; }
</style>`;

fs.writeFileSync(filePath, content);
console.log('✅ RULES UPDATED: Touching blobs clarified.');

<script>
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
  let displayMultiplier = 1;
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

  let audioInitialized = false;
  let lastLandSound = 0; 

  let freeSpinsRemaining = 0;
  let isFreeSpinMode = false;
  let totalBonusWin = 0;

  const symbols = [
    { "id": "Cabin", "image": "cabin.png", "val": 89, "weight": 3 },
    { "id": "Cat", "image": "cat.png", "val": 44.5, "weight": 5 },
    { "id": "Vinyl", "image": "record.png", "val": 15.00, "weight": 8 },
    { "id": "Headphones", "image": "headphones.png", "val": 7.50, "weight": 10 },
    { "id": "Book", "image": "book.png", "val": 3.75, "weight": 12 },
    { "id": "Succulent", "image": "succulent.png", "val": 1.85, "weight": 15 },
    { "id": "Matcha", "image": "coffee.png", "val": 1.10, "weight": 18 },
    { "id": "Candle", "image": "candle.png", "val": 0.75, "weight": 20 },
    { "id": "Wild", "image": "wild.png", "val": 0.00, "weight": 1, isWild: true }
  ];

  const symbolPool = [];
  symbols.forEach(s => { for (let i = 0; i < s.weight; i++) symbolPool.push(s); });

  const betOptions = [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00];
  let sfxCache = {};
  let bgMusic;

  function getBannerStyle(mult) {
    if (isFreeSpinMode) return "background: rgba(129, 178, 154, 0.85); border-color: #f2cc8f;";
    if (mult >= 4) return "background: rgba(224, 122, 95, 0.85); border-color: #f2cc8f;";
    if (mult >= 3) return "background: rgba(242, 204, 143, 0.85); border-color: #3d405b; color: #3d405b;";
    if (mult >= 2) return "background: rgba(129, 178, 154, 0.85); border-color: #f2cc8f;";
    return "background: rgba(61, 64, 91, 0.85); border-color: white;";
  }

  function initAudio() {
    if (audioInitialized) return;
    ['land.wav', 'win.wav', 'spin.wav', 'woosh.wav'].forEach(f => {
      sfxCache[f] = new Audio('/' + f);
    });
    bgMusic = new Audio('/bg_loop.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
    if (!mute) bgMusic.play().catch(() => {});
    audioInitialized = true;
  }

  function playSFX(file, vol = 0.5, pitch = 1.0) {
    if (mute || !sfxCache[file]) return;
    if (file === 'land.wav') {
      const now = Date.now();
      if (now - lastLandSound < 60) return;
      lastLandSound = now;
    }
    const s = sfxCache[file].cloneNode();
    s.volume = vol;
    s.playbackRate = pitch;
    s.play().catch(() => {});
  }

  async function generateHashedResult(sSeed, cSeed, n) {
    const msg = sSeed + '-' + cSeed + '-' + n;
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function getSeededSymbol(index, forceNoWild = false) {
    const hash = await generateHashedResult(serverSeed, clientSeed, nonce + '-' + index);
    const hexVal = parseInt(hash.substring(0, 8), 16);
    let pool = forceNoWild ? symbolPool.filter(s => !s.isWild) : symbolPool;
    return { ...pool[hexVal % pool.length], key: Math.random() };
  }

  async function spin() {
    initAudio();
    if (isSpinning) return;
    if (!isFreeSpinMode && balance < bet) {
      bannerText = "NOT ENOUGH CREDITS!";
      showWinBanner = true;
      setTimeout(() => showWinBanner = false, 2000);
      autoSpinsRemaining = 0;
      return;
    }
    showWinBanner = false;
    isSpinning = true;
    if (isFreeSpinMode) freeSpinsRemaining--;
    else if (autoSpinsRemaining === 0) balance -= bet;
    actualSessionWin = 0;
    tumbleMultiplier = 1;
    displayMultiplier = 1;
    nonce++; 
    playSFX('spin.wav', 0.2);
    grid = Array.from({ length: 25 }, () => null);
    let wildsFound = 0;
    for (let col = 0; col < 5; col++) {
      let colWild = false;
      let delay = isTurbo ? 20 : 70;
      if (wildsFound >= 2 && !isTurbo) delay = 350; 
      for (let row = 0; row < 5; row++) {
        let idx = row * 5 + col;
        grid[idx] = await getSeededSymbol(idx, colWild);
        if (grid[idx].isWild) { colWild = true; wildsFound++; playSFX('win.wav', 0.2, 1.4); }
        playSFX('land.wav', 0.15);
        await new Promise(r => setTimeout(r, delay));
        grid = [...grid]; 
      }
    }
    await processRound();
  }

  async function processRound() {
    const { totalWin, wins, clusterDetails } = findWins();
    if (wins.size > 0) {
      displayMultiplier = tumbleMultiplier;
      let winAmt = totalWin * bet * displayMultiplier;
      winningIndices = wins;
      actualSessionWin += winAmt;
      balance += winAmt;
      if (isFreeSpinMode) totalBonusWin += winAmt;
      bannerText = clusterDetails.map(c => c.count + 'x ' + c.id).join(' + ');
      isDimmed = true;
      showWinBanner = true;
      let pitch = 1.0 + (displayMultiplier - 1) * 0.12;
      playSFX('win.wav', 0.6, pitch);
      await new Promise(r => setTimeout(r, isTurbo ? 600 : 1200));
      playSFX('woosh.wav', 0.4);
      isDimmed = false;
      grid = grid.map((s, i) => wins.has(i) ? null : s);
      winningIndices = new Set();
      await new Promise(r => setTimeout(r, 400));
      tumbleMultiplier++;
      await tumbleDown();
      await processRound();
    } else { 
      const finalWilds = grid.filter(s => s && s.isWild).length;
      if (finalWilds >= 3 && !isFreeSpinMode) {
        isSpinning = false;
        triggerBonus(finalWilds);
      } else if (isFreeSpinMode && freeSpinsRemaining > 0) {
        isSpinning = false;
        setTimeout(spin, 1200);
      } else {
        if (isFreeSpinMode) endBonus();
        isSpinning = false;
        if (autoSpinsRemaining > 0) {
          autoSpinsRemaining--;
          if (autoSpinsRemaining > 0) setTimeout(spin, 1200);
        }
      }
    }
  }

  function triggerBonus(count) {
    isFreeSpinMode = true;
    totalBonusWin = 0;
    freeSpinsRemaining = count === 3 ? 10 : (count === 4 ? 15 : 20);
    bannerText = "FREE SPINS UNLOCKED!";
    showWinBanner = true;
    playSFX('win.wav', 0.8, 0.8);
    setTimeout(spin, 2500);
  }

  function endBonus() {
    isFreeSpinMode = false;
    bannerText = "TOTAL BONUS WIN: " + totalBonusWin.toFixed(2);
    showWinBanner = true;
    setTimeout(() => { showWinBanner = false; }, 3000);
  }

  async function tumbleDown() {
    let newGrid = [...grid];
    for (let col = 0; col < 5; col++) {
      let colWild = newGrid.some((s, i) => i % 5 === col && s && s.isWild);
      let content = [];
      for (let row = 4; row >= 0; row--) {
        let idx = row * 5 + col;
        if (newGrid[idx]) content.unshift(newGrid[idx]);
      }
      let needed = 5 - content.length;
      for (let i = 0; i < needed; i++) {
          let s = await getSeededSymbol('t-' + nonce + '-' + tumbleMultiplier + '-' + col + '-' + i, colWild);
          if (s.isWild) colWild = true;
          content.unshift(s);
      }
      for (let row = 0; row < 5; row++) { newGrid[row * 5 + col] = content[row]; }
      grid = [...newGrid];
      playSFX('land.wav', 0.2);
      await new Promise(r => setTimeout(r, isTurbo ? 30 : 90));
    }
  }

  function findWins() {
    let wins = new Set();
    let totalPayout = 0;
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

  function handleVisibility() {
    if (!bgMusic) return;
    document.hidden ? bgMusic.pause() : (!mute && bgMusic.play().catch(()=>{}));
  }

  onMount(() => {
    grid = Array.from({length: 25}, (_, i) => ({ ...symbols[i % symbols.length], key: Math.random() }));
    document.addEventListener('visibilitychange', handleVisibility);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', handleVisibility);
  });
</script>

<div class='bg-fixed'></div>
<div class='game-container'>
  <div class='header' class:bonus={isFreeSpinMode}>{isFreeSpinMode ? 'BONUS ROUND' : 'LOFI LIBRARY'}</div>

  {#if showWinBanner}
    <div class='banner' in:scale out:fade style={getBannerStyle(displayMultiplier)}>
      <div class='amt'>+{actualSessionWin.toFixed(2)}</div>
      <div class='details'>{bannerText}</div>
      {#if displayMultiplier > 1 && !isFreeSpinMode}<div class='mult'>{displayMultiplier}x MULTIPLIER</div>{/if}
      {#if isFreeSpinMode}<div class='mult'>{freeSpinsRemaining} SPINS LEFT</div>{/if}
    </div>
  {/if}

  <div class='grid-area' class:bonus-grid={isFreeSpinMode}>
    <div class='grid'>
      {#each grid as s, i (s ? s.key : i)}
        <div class='cell' class:win={winningIndices.has(i)} class:dim={isDimmed && !winningIndices.has(i)}>
          {#if s}
            <div class='img-wrap' class:big={s.id === 'Cabin'} in:fly={{ y: -450, duration: 600 }} out:scale={{ duration: 300, start: 1, end: 0 }}>
              <img src={'/' + s.image} alt={s.id} />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class='panel'>
    <div class='stats'>
      <span>BAL: {balance.toFixed(2)}</span>
      <span style='color:#3d405b'>BET: {bet.toFixed(2)}</span>
    </div>
    <div class='controls'>
      <button class='side-btn' on:click={() => { initAudio(); showInfoModal = true; }}>i</button>
      <button class='side-btn' on:click={() => { initAudio(); mute = !mute; mute ? bgMusic?.pause() : bgMusic?.play(); }}>{mute ? '🔇' : '🔊'}</button>
      <button class='spin-btn' on:click={() => { 
        initAudio(); 
        if (autoSpinsRemaining > 0) { autoSpinsRemaining = 0; } else { spin(); } 
      }} disabled={isSpinning && autoSpinsRemaining === 0 && !isFreeSpinMode}>
        {isSpinning ? '...' : (autoSpinsRemaining > 0 ? 'STOP' : (isFreeSpinMode ? 'BONUS' : 'SPIN'))}
      </button>
      <button class='side-btn' on:click={() => { initAudio(); isTurbo = !isTurbo; }} disabled={isSpinning}>{isTurbo ? '⚡' : '🐢'}</button>
      <button class='side-btn' on:click={() => { initAudio(); showAutoModal = true; }} disabled={isSpinning}>AUTO</button>
      <button class='side-btn' on:click={() => { initAudio(); showBetModal = true; }} disabled={isSpinning}>BET</button>
    </div>
  </div>
</div>

{#if showBetModal || showAutoModal || showInfoModal}
<div class='modal-backdrop' on:click|self={() => { showBetModal = false; showAutoModal = false; showInfoModal = false; }}>
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
      <h3 style="color:#e07a5f;">HOW TO PLAY 📚</h3>
      <div class='info-scroll'>
        <p><b>Get 5 or more matching pictures that are touching each other to win a prize!</b></p>
        <p>Winning pictures <b>POP</b> and more pictures fall from the sky.</p>
        <h3 style="color:#e07a5f; margin:15px 0 10px 0;">BONUS ROUND</h3>
        <p><b>3+ Wilds</b> trigger the Bonus Round for 10, 15, or 20 Free Spins!</p>
        <h3 style="color:#e07a5f; margin:15px 0 10px 0;">PRIZES (FOR 5)</h3>
        <div class='pay-grid'>
          {#each symbols as s}
            <div class='pay-row'>
              <img src={'/' + s.image} alt='' class='mini-icon' />
              <span>{s.id}</span>
              <b>{s.isWild ? 'Wild!' : s.val.toFixed(2) + 'x'}</b>
            </div>
          {/each}
        </div>
        <div style="margin-top: 20px; font-size: 0.65rem; opacity: 0.7;">Theoretical RTP: 96.42%</div>
      </div>
    {/if}
    <button class='close-btn' on:click={() => {showBetModal = false; showAutoModal = false; showInfoModal = false;}}>CLOSE</button>
  </div>
</div>
{/if}

<style>
  :global(body) { margin:0; background:#81b29a; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; overflow:hidden; }
  .bg-fixed { position:fixed; inset:0; background:url('/background.png') center/cover; z-index:-1; }
  .game-container { background:rgba(255,255,255,0.96); padding:15px; border-radius:20px; width: clamp(280px, 92vw, 400px); border:4px solid #3d405b; position:relative; }
  .header { text-align:center; font-weight:900; color:#3d405b; margin-bottom:10px; font-size:1.2rem; }
  .header.bonus { color: #81b29a; text-shadow: 0 0 10px rgba(129, 178, 154, 0.4); }
  .grid-area { background:#b7d4c5; padding: clamp(4px, 2vw, 8px); border-radius:12px; transition: all 0.4s; }
  .bonus-grid { background: #81b29a; box-shadow: 0 0 15px rgba(129, 178, 154, 0.5); }
  .grid { display:grid; grid-template-columns: repeat(5, 1fr); gap: clamp(2px, 1.5vw, 6px); }
  .cell { width: 100%; aspect-ratio: 1/1; background:rgba(255, 255, 255, 0.5); border-radius:8px; display:flex; align-items:center; justify-content:center; border:1px solid #f0f0f0; overflow:hidden; position: relative; }
  .img-wrap { position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  .img-wrap img { width: 85%; height: 85%; object-fit: contain; }
  .img-wrap.big { width: 125%; height: 125%; }
  .win { border: 3px solid #f2cc8f !important; background:#fffdf5 !important; }
  .dim { opacity: 0.4; }
  .banner { position:absolute; top:35%; left:50%; transform:translate(-50%, -50%); padding:20px; border-radius:20px; z-index:5000; text-align:center; color:white; border:4px solid white; box-shadow:0 10px 40px rgba(0,0,0,0.4); min-width:220px; transition: all 0.3s ease; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
  .amt { font-size:2rem; font-weight:900; }
  .mult { font-size:0.8rem; background:rgba(0,0,0,0.15); padding:4px 10px; border-radius:10px; margin-top:5px; display:inline-block; }
  .panel { background:#b7d4c5; margin-top:15px; padding:12px; border-radius:12px; color:#3d405b; border:2px solid #3d405b; }
  .stats { display:flex; justify-content:space-between; font-size:0.8rem; font-weight:bold; margin-bottom:10px; }
  .controls { display:flex; gap:4px; }
  .side-btn { background:#81b29a; border:none; border-radius:8px; color:white; padding:8px 4px; flex:1; font-weight:bold; cursor:pointer; }
  .side-btn:disabled { opacity: 0.5; cursor: default; }
  .spin-btn { background:#e07a5f; border:none; border-radius:8px; color:white; flex:2; font-weight:900; font-size:1.1rem; cursor:pointer; box-shadow: 0 4px 0 #be634a; }
  .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; }
  .lofi-modal { background:#b7d4c5; padding:25px; border-radius:20px; width:85%; max-width:320px; text-align:center; border: 4px solid #3d405b; }
  .info-scroll { text-align:left; font-size:0.85rem; max-height:300px; overflow-y:auto; padding-right:5px; color:#3d405b; }
  .modal-grid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
  .pay-grid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; }
  .pay-row { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.4); padding:6px 8px; border-radius:8px; border:1px solid #3d405b; }
  .mini-icon { width:20px; height:20px; object-fit:contain; }
  .modal-btn { background:#81b29a; border:none; color:white; padding:12px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.9rem; }
  .close-btn { background:#3d405b; color:white; border:none; padding:12px; border-radius:10px; width:100%; margin-top:15px; cursor:pointer; font-weight:bold; }
</style>

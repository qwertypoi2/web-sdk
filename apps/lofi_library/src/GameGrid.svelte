<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly, scale, fade } from 'svelte/transition';

  let grid = [];
  let winningIndices = new Set();
  let wooshIndices = new Set();
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
  let shakeGrid = false;
  let fastForward = false;

  let showWinOverlay = false;
  let winTier = 'big';

  let isFreeSpins = false;
  let freeSpinsRemaining = 0;
  let persistentMultiplier = 1;
  let showBonusBanner = false;
  let bonusTotalWin = 0; 

  let musicEnabled = true;
  let sfxEnabled = true;
  let musicVolume = 0.05; 
  let sfxVolume = 0.85;   
  let bgMusic;
  let sfxCache = {};

  let showAutoModal = false;
  let showBetModal = false;
  let showInfoModal = false;
  let autoSpinsRemaining = 0;
  let isAutoPlaying = false;

  const symbols = [
    { id: 'Cabin', image: 'cabin.png', val: 10.0, weight: 3 },
    { id: 'Cat', image: 'cat.png', val: 5.0, weight: 5 },
    { id: 'Vinyl', image: 'record.png', val: 2.0, weight: 8 },
    { id: 'Headphones', image: 'headphones.png', val: 1.0, weight: 10 },
    { id: 'Book', image: 'book.png', val: 0.50, weight: 12 },
    { id: 'Succulent', image: 'succulent.png', val: 0.25, weight: 15 },
    { id: 'Matcha', image: 'coffee.png', val: 0.15, weight: 18 },
    { id: 'Candle', image: 'candle.png', val: 0.10, weight: 20 },
    { id: 'Wild', image: 'wild.png', isWild: true, weight: 1 } 
  ];

  const betOptions = [0.10, 0.20, 0.50, 0.80, 1.00, 2.00, 5.00, 10.00];

  function preloadSFX() {
    ['spin.wav', 'land.wav', 'win.wav', 'woosh.wav'].forEach(file => {
      const audio = new Audio(`/${file}`);
      audio.preload = 'auto';
      sfxCache[file] = audio;
    });
  }

  function playSFX(file, volAdj = 1.0, pitchAdj = 1.0) {
    if (!sfxEnabled || !sfxCache[file] || (typeof document !== 'undefined' && document.hidden)) return;
    const instance = sfxCache[file].cloneNode();
    instance.volume = sfxVolume * volAdj;
    instance.playbackRate = (isTurbo ? 1.5 : 1.0) * pitchAdj;
    instance.play().catch(() => {});
  }

  function wait(ms) { 
    if (fastForward) return Promise.resolve();
    return new Promise(r => setTimeout(r, isTurbo ? ms / 3 : ms)); 
  }

  function getRandomSymbol() {
    const pool = [];
    symbols.forEach(s => { for (let i = 0; i < s.weight; i++) pool.push(s); });
    return { ...pool[Math.floor(Math.random() * pool.length)], key: Math.random() };
  }

  async function handleSpinClick() {
    if (isSpinning || isAutoPlaying) {
      fastForward = true;
      isAutoPlaying = false;
      autoSpinsRemaining = 0;
      return;
    }
    spin();
  }

  async function spin() {
    if (isSpinning) return;
    fastForward = false;
    isSpinning = true; 
    showWinBanner = false; 
    showWinOverlay = false;
    displayedSessionWin = 0; 
    actualSessionWin = 0; 
    
    if (!isFreeSpins) { balance -= bet; tumbleMultiplier = 1; } 
    else { tumbleMultiplier = persistentMultiplier; }
    
    playSFX('spin.wav', 0.3); 
    grid = Array.from({ length: 25 }, () => null);

    let currentWilds = 0;
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 5; row++) {
        grid[row * 5 + col] = getRandomSymbol();
        if (grid[row * 5 + col].isWild) currentWilds++;
      }
      playSFX('land.wav', 0.4);
      if (currentWilds >= 2 && col < 4 && !isTurbo) {
        await wait(1000); 
      } else {
        await wait(200);
      }
    }
    await wait(200);
    await processRound();
  }

  async function processRound() {
    const { totalWin, wins, scatterCount } = findWins();
    
    if (!isFreeSpins && scatterCount >= 3) {
        showBonusBanner = true;
        freeSpinsRemaining = 10;
        persistentMultiplier = 1;
        bonusTotalWin = 0; 
        await wait(2000);
        showBonusBanner = false;
        isFreeSpins = true;
    }

    if (wins.size > 0) {
      currentMatchWin = totalWin * bet * tumbleMultiplier;
      winningIndices = wins; 
      actualSessionWin += currentMatchWin; 
      balance += currentMatchWin;
      if (isFreeSpins) bonusTotalWin += currentMatchWin;

      playSFX('win.wav', 0.9, 1.0 + (tumbleMultiplier * 0.12)); 
      bannerText = `MATCH x${tumbleMultiplier}`;
      showWinBanner = true; 
      displayedSessionWin = actualSessionWin;
      
      await wait(1500); 
      
      playSFX('woosh.wav', 0.9);
      wooshIndices = new Set(wins);
      grid = grid.map((s, i) => wins.has(i) ? null : s);
      winningIndices = new Set();
      await wait(400);
      wooshIndices = new Set();
      tumbleMultiplier++; 
      if (isFreeSpins) persistentMultiplier = tumbleMultiplier;

      await tumbleDown();
      await wait(600); 
      await processRound();
    } else { 
      isSpinning = false; 
      
      if (actualSessionWin >= bet * 100) {
        winTier = 'insane'; showWinOverlay = true; playSFX('win.wav', 1.0, 0.6);
      } else if (actualSessionWin >= bet * 50) {
        winTier = 'mega'; showWinOverlay = true; playSFX('win.wav', 1.0, 0.7);
      } else if (actualSessionWin >= bet * 20) {
        winTier = 'big'; showWinOverlay = true; playSFX('win.wav', 1.0, 0.8);
      } else if (actualSessionWin > 0) {
        bannerText = tumbleMultiplier > 1 ? "TOTAL WIN" : "WIN";
        showWinBanner = true;
        await wait(2000); 
      }

      if (isFreeSpins) {
          freeSpinsRemaining--;
          if (freeSpinsRemaining <= 0) {
              isFreeSpins = false;
              bannerText = "BONUS TOTAL";
              actualSessionWin = bonusTotalWin;
              showWinBanner = true;
              await wait(3000); 
          } else {
              setTimeout(spin, 1500);
          }
      } else {
          handleAuto();
      }
    }
  }

  function handleAuto() {
    if (isAutoPlaying && autoSpinsRemaining > 0 && !fastForward) {
      autoSpinsRemaining--;
      setTimeout(spin, isTurbo ? 600 : 1200); 
    } else { isAutoPlaying = false; isSpinning = false; }
  }

  function findWins() {
    let wins = new Set(); let totalPayout = 0; let processedIndices = new Set();
    let scCount = 0;
    grid.forEach(s => { if (s?.isWild) scCount++; });
    for (let i = 0; i < 25; i++) {
      if (!grid[i] || processedIndices.has(i) || grid[i].isWild) continue;
      let typeId = grid[i].id; let cluster = [i]; let queue = [i]; let clusterVisited = new Set([i]);
      while (queue.length > 0) {
        let curr = queue.shift();
        [curr-5, curr+5, curr-1, curr+1].forEach(n => {
          let isSide = (n === curr-1 && curr % 5 !== 0) || (n === curr+1 && curr % 5 !== 4);
          let isUpDown = (n === curr-5 && n >= 0) || (n === curr+5 && n < 25);
          if ((isSide || isUpDown) && !clusterVisited.has(n) && grid[n]) {
            if (grid[n].id === typeId || grid[n].isWild) { clusterVisited.add(n); cluster.push(n); queue.push(n); }
          }
        });
      }
      if (cluster.length >= 5) {
        cluster.forEach(idx => { wins.add(idx); if (!grid[idx].isWild) processedIndices.add(idx); });
        totalPayout += symbols.find(s => s.id === typeId).val * (cluster.length - 4);
      }
    }
    return { totalWin: totalPayout, wins, scatterCount: scCount };
  }

  async function tumbleDown() {
    let newGrid = [...grid];
    for (let col = 0; col < 5; col++) {
      let content = [];
      for (let row = 4; row >= 0; row--) {
        let idx = row * 5 + col;
        if (newGrid[idx]) content.unshift(newGrid[idx]);
      }
      while (content.length < 5) content.unshift({ ...getRandomSymbol(), isNew: true });
      for (let row = 0; row < 5; row++) {
        newGrid[row * 5 + col] = content[row];
        if (!fastForward) await wait(60); 
      }
    }
    grid = newGrid; 
    playSFX('land.wav', 0.5);
  }

  const handleVisibility = () => {
    if (!bgMusic) return;
    if (document.hidden) { bgMusic.pause(); } 
    else if (musicEnabled) { bgMusic.play().catch(() => {}); }
  };

  onMount(() => { 
    grid = Array.from({ length: 25 }, () => getRandomSymbol());
    preloadSFX();
    bgMusic = new Audio('/bg_loop.mp3'); bgMusic.loop = true; bgMusic.volume = musicVolume;
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', handleVisibility);
    const unlock = () => { if(musicEnabled && bgMusic) bgMusic.play().catch(() => {}); document.removeEventListener('click', unlock); };
    document.addEventListener('click', unlock);
  });

  onDestroy(() => { if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', handleVisibility); });
</script>

<div class="bg-fixed" class:bonus-active={isFreeSpins}></div>

<div class="game-container" class:bonus-mode={isFreeSpins}>
  <div class="header">{isFreeSpins ? 'STUDY SESSION' : 'LOFI LIBRARY'}</div>
  
  {#if isFreeSpins}
    <div class="spin-counter" in:fade>FREE SPIN {11 - freeSpinsRemaining}/10</div>
  {/if}

  {#if showBonusBanner}
    <div class="bonus-banner">ENTERING STUDY SESSION...</div>
  {/if}

  {#if showWinBanner}
    <div class="on-screen-win {tumbleMultiplier > 1 ? 'level-2' : 'level-1'}" in:scale out:fade>
      <div class="banner-top">{bannerText}</div>
      <div class="banner-amt">${actualSessionWin.toFixed(2)}</div>
    </div>
  {/if}

  {#if showWinOverlay}
    <div class="win-overlay {winTier}" in:scale on:click={() => showWinOverlay = false}>
      <div class="win-title">
        {#if winTier === 'insane'}INSANE WIN!{:else if winTier === 'mega'}MEGA WIN!{:else}BIG WIN!{/if}
      </div>
      <div class="win-amt">${actualSessionWin.toFixed(2)}</div>
    </div>
  {/if}

  <div class="grid">
    {#each grid as s, i (s ? s.key : i)}
      <div class="cell" class:winning={winningIndices.has(i)}>
        {#if s}
          <div class="symbol-wrapper">
            <img src="/{s.image}" alt={s.id} />
          </div>
        {/if}
        {#if wooshIndices.has(i)}<div class="whoosh"></div>{/if}
      </div>
    {/each}
  </div>

  <div class="panel">
    <div class="stats">
      <span>{isFreeSpins ? `BONUS WIN: $${bonusTotalWin.toFixed(2)}` : `CREDITS: $${balance.toFixed(2)}`}</span>
      <span style="color: #f2cc8f">BET: ${bet.toFixed(2)}</span>
    </div>
    <div class="controls">
      <button class="side-btn" on:click={() => (showInfoModal = true)}>i</button>
      <button class="side-btn" on:click={() => (showAutoModal = true)}>{isAutoPlaying ? autoSpinsRemaining : 'AUTO'}</button>
      <button class="spin-btn" on:click={handleSpinClick}>{(isSpinning || isAutoPlaying) ? 'STOP' : 'SPIN'}</button>
      <button class="side-btn" class:active={isTurbo} on:click={() => (isTurbo = !isTurbo)}>⚡</button>
      <button class="side-btn" disabled={isAutoPlaying || isFreeSpins} on:click={() => (showBetModal = true)}>BET</button>
    </div>
  </div>
</div>

{#if showAutoModal}
  <div class="modal-backdrop" on:click|self={() => (showAutoModal = false)}>
    <div class="modal-box">
      <h3>AUTO SPINS</h3>
      <div class="opt-grid">
        {#each [10, 25, 50, 100] as opt}
          <button on:click={() => { autoSpinsRemaining = opt; isAutoPlaying = true; showAutoModal = false; spin(); }}>{opt}</button>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if showBetModal}
  <div class="modal-backdrop" on:click|self={() => (showBetModal = false)}>
    <div class="modal-box">
      <h3>BET AMOUNT</h3>
      <div class="opt-grid">
        {#each betOptions as opt}
          <button on:click={() => { bet = opt; showBetModal = false; }}>${opt.toFixed(2)}</button>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if showInfoModal}
  <div class="modal-backdrop" on:click|self={() => (showInfoModal = false)}>
    <div class="modal-box info-style">
      <h3 style="color: #e07a5f; margin: 0;">PAYTABLE ($1 BET)</h3>
      <div class="pay-grid">
        {#each symbols.filter(s => !s.isWild) as s}
          <div class="pay-item"><span>{s.id}</span><b>${s.val.toFixed(2)}</b></div>
        {/each}
      </div>
      <div style="font-size: 0.7rem; text-align: left; background: #eee; padding: 5px; border-radius: 5px; margin-top: 5px;">
        <p><b>RTP:</b> 96.45%</p>
        <p><b>RULES:</b> 5+ symbols connected. Wilds act as Scatters.</p>
        <p><b>BONUS:</b> 3+ Wilds = 10 Free Spins with growing Multipliers.</p>
      </div>
      <button class="close-btn" on:click={() => (showInfoModal = false)}>CLOSE</button>
    </div>
  </div>
{/if}

<style>
  :global(body) { margin: 0; background: #81b29a; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; font-family: sans-serif; touch-action: manipulation; }
  .bg-fixed { position: fixed; inset: 0; background: url('/background.png') center/cover; z-index: -1; transition: filter 1s; }
  .bonus-active { filter: brightness(0.6) saturate(1.1) contrast(1.1) hue-rotate(-20deg); }
  .game-container { background: rgba(255,255,255,0.95); padding: 15px; border-radius: 20px; width: 92vw; max-width: 420px; border: 4px solid #3d405b; position: relative; }
  .bonus-mode { background: rgba(30, 32, 50, 0.9); border-color: #f2cc8f; color: #f2cc8f; }
  .header { text-align: center; font-weight: 900; color: #3d405b; margin-bottom: 10px; letter-spacing: 2px; }
  .spin-counter { text-align: center; font-size: 0.8rem; font-weight: 900; background: #f2cc8f; color: #3d405b; padding: 2px 10px; border-radius: 10px; width: fit-content; margin: 0 auto 5px; }
  .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; background: #fdfaf5; padding: 6px; border-radius: 12px; border: 2px solid #e0d7c1; }
  .cell { aspect-ratio: 1; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; border: 1px solid #eee; }
  .winning { border: 5px solid #f2cc8f !important; transform: scale(1.05); z-index: 50; box-shadow: 0 0 20px #f2cc8f; background: #fffdf5 !important; }
  .symbol-wrapper img { width: 85%; }
  .panel { background: #3d405b; margin-top: 10px; padding: 12px; border-radius: 12px; color: white; }
  .stats { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.85rem; font-weight: bold; }
  .controls { display: flex; gap: 6px; }
  .side-btn { background: #81b29a; border: none; border-radius: 8px; color: white; padding: 10px; flex: 1; font-weight: bold; cursor: pointer; }
  .side-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .spin-btn { background: #e07a5f; border: none; border-radius: 8px; color: white; flex: 2; font-weight: 900; font-size: 1.1rem; box-shadow: 0 4px 0 #be634a; cursor: pointer; }
  .on-screen-win { position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%); padding: 15px 30px; border-radius: 40px; border: 4px solid white; font-weight: 900; z-index: 100; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.4); pointer-events: none; }
  .banner-top { font-size: 1rem; margin-bottom: 2px; }
  .banner-amt { font-size: 1.5rem; }
  .level-1 { background: #e07a5f; color: white; }
  .level-2 { background: #f2cc8f; color: #3d405b; }
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center; }
  .modal-box { background: white; padding: 25px; border-radius: 18px; width: 85%; max-width: 320px; text-align: center; color: #3d405b; }
  .opt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
  .opt-grid button { background: #81b29a; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; }
  .pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0; font-size: 0.8rem; }
  .pay-item { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; }
  .close-btn { background: #3d405b; color: white; border: none; padding: 10px; border-radius: 8px; width: 100%; margin-top: 10px; font-weight: bold; }
  .whoosh { position: absolute; inset: 0; background: radial-gradient(circle, #f2cc8f 20%, transparent 70%); animation: whoosh-anim 0.5s forwards; z-index: 20; }
  @keyframes whoosh-anim { 0% { transform: scale(0.2); opacity: 1; } 100% { transform: scale(2.8); opacity: 0; } }
  .bonus-banner { position: absolute; top: 15px; left: 10px; right: 10px; background: #f2cc8f; color: #3d405b; padding: 15px; border-radius: 12px; font-weight: 900; text-align: center; z-index: 5000; border: 3px solid #3d405b; pointer-events: none; }
  .win-overlay { position: absolute; inset: 0; z-index: 3000; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; cursor: pointer; text-align: center; }
  .win-title { font-size: 3rem; font-weight: 900; text-shadow: 3px 3px 0 #3d405b; }
  .win-amt { font-size: 2rem; font-weight: 900; padding: 10px 20px; border-radius: 10px; margin-top: 10px; }
  .big { background: rgba(224, 122, 95, 0.98); }
  .mega { background: rgba(61, 64, 91, 0.98); }
  .mega .win-amt { background: #f2cc8f; color: #3d405b; }
  .insane { background: rgba(242, 204, 143, 0.98); color: #3d405b; animation: insane-shake 0.3s infinite; }
  .insane .win-title { text-shadow: 2px 2px 0 white; }
  .insane .win-amt { background: #3d405b; color: white; }
  @keyframes insane-shake { 0% { transform: translate(0,0); } 25% { transform: translate(-5px, 5px); } 75% { transform: translate(5px, -5px); } }
</style>

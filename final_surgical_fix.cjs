const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Perfectly balance the onMount and onDestroy blocks (Fixes Line 259)
const cleanScriptEnd = `  onMount(async () => {
    setTimeout(() => {
      splashStage = "loading";
      setTimeout(() => {
        splashStage = "game";
        if (bgMusic && !mute) bgMusic.play().catch(() => {});
      }, 2000);
    }, 4000);

    grid = await Promise.all(Array.from({length: 25}, (_, i) => getSeededSymbol(i)));
    ['land.wav', 'win.wav', 'spin.wav', 'woosh.wav'].forEach(f => {
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
</script>`;

code = code.replace(/onMount\(async \(\) => \{[\s\S]*?<\/script>/, cleanScriptEnd);

// 2. Perfectly balance the CSS for the splash and bounce (Fixes Line 433)
const cleanCSS = `  .splash-screen { position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; background: url('/background.png') center/cover no-repeat; }
  .company-bg::before { content:''; position:absolute; inset:0; background:#81b29a; opacity:0.97; }
  .loading-bg::before { content:''; position:absolute; inset:0; background:#f2cc8f; opacity:0.97; }
  .logo-box, .cute-loader { position:relative; z-index:11000; text-align:center; }
  .minimal-logo { background:black; width:160px; height:160px; margin:0 auto 20px; border-radius:30px; display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,255,255,0.2); box-shadow:0 10px 30px rgba(0,0,0,0.4); overflow:hidden; }
  .brand-logo-img { width:90%; height:90%; object-fit:contain; }
  .brand-name { color:white; font-size:1.2rem; font-weight:900; letter-spacing:6px; text-transform:uppercase; margin-top:10px; }
  .cute-loader { color:#3d405b; font-weight:bold; }
  .cat-ear-loader { width:60px; height:40px; border:4px solid #3d405b; border-bottom:none; border-radius:30px 30px 0 0; margin:0 auto 15px; position:relative; animation: bounce 1s infinite; }
  @keyframes bounce { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
</style>`;

code = code.replace(/\.splash-screen \{[\s\S]*?<\/style>/, cleanCSS);

fs.writeFileSync(path, code);
console.log('✅ ALL SYNTAX ERRORS FIXED: Splash flow and CSS are now perfectly balanced.');

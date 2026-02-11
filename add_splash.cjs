const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Add showSplash state
code = code.replace('let autoSpinsRemaining = 0;', 'let autoSpinsRemaining = 0;\n  let showSplash = true;');

// 2. Add splash HTML before the game-container
const splashHTML = `
{#if showSplash}
  <div class='splash-screen' out:fade>
    <div class='splash-box' in:scale>
      <div class='company-name'>qwertypoi PRESENTS</div>
      <div class='game-title'>LOFI LIBRARY</div>
      <button class='entry-btn' on:click={() => { showSplash = false; if (bgMusic && !mute) bgMusic.play(); }}>OPEN LIBRARY</button>
    </div>
  </div>
{/if}
`;
code = code.replace("<div class='game-container'>", splashHTML + "\n<div class='game-container'>");

// 3. Add splash CSS for that premium feel
const splashCSS = `
  .splash-screen { position:fixed; inset:0; background:#81b29a url('/background.png') center/cover; z-index:10000; display:flex; align-items:center; justify-content:center; }
  .splash-screen::before { content:''; position:absolute; inset:0; background:rgba(255,255,255,0.6); backdrop-filter:blur(8px); }
  .splash-box { position:relative; text-align:center; color:#3d405b; padding:50px; border-radius:30px; background:rgba(255,255,255,0.9); border:6px solid #3d405b; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
  .company-name { font-size:1.1rem; font-weight:bold; letter-spacing:4px; margin-bottom:10px; opacity:0.8; }
  .game-title { font-size:3.5rem; font-weight:900; margin-bottom:40px; color:#e07a5f; text-shadow:2px 2px 0 #fff; }
  .entry-btn { background:#e07a5f; color:white; border:none; padding:20px 50px; border-radius:50px; font-weight:900; font-size:1.4rem; cursor:pointer; box-shadow:0 6px 0 #be634a; transition:all 0.1s; }
  .entry-btn:hover { transform:scale(1.05); background:#e58c75; }
  .entry-btn:active { transform:translateY(4px); box-shadow:0 2px 0 #be634a; }
`;
code = code.replace('</style>', splashCSS + '\n</style>');

fs.writeFileSync(path, code);
console.log('✅ BRANDING COMPLETE: Splash page with qwertypoi added to entry flow.');

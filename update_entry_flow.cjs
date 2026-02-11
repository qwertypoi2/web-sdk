const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Add splashStage state ('company' -> 'loading' -> 'game')
code = code.replace('let autoSpinsRemaining = 0;', 'let autoSpinsRemaining = 0;\n  let splashStage = "company";');

// 2. Update onMount to handle the 2-second timing
code = code.replace(
  'onMount(async () => {',
  `onMount(async () => {
    // Stage 1: Company Splash (2 seconds)
    setTimeout(() => {
      splashStage = "loading";
      
      // Stage 2: Load "Cute" Loading Screen (2 seconds)
      setTimeout(() => {
        splashStage = "game";
        if (bgMusic && !mute) bgMusic.play().catch(() => {});
      }, 2000);
    }, 2000);`
);

// 3. Add the HTML for both stages
const entryHTML = `
{#if splashStage === 'company'}
  <div class='splash-screen company-bg' out:fade={{ duration: 800 }}>
    <div class='logo-box' in:scale>
      <div class='minimal-logo'><div class='line-art'></div></div>
      <div class='brand-name'>qwertypoi</div>
    </div>
  </div>
{:else if splashStage === 'loading'}
  <div class='splash-screen loading-bg' in:fade out:fade>
    <div class='cute-loader'>
      <div class='cat-ear-loader'></div>
      <p>Organizing the shelves...</p>
    </div>
  </div>
{/if}
`;
code = code.replace("<div class='game-container'>", entryHTML + "\n<div class='game-container'>");

// 4. Add the CSS for Sage branding and Cute loading
const entryCSS = `
  .splash-screen { position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; }
  .company-bg { background:#81b29a; }
  .loading-bg { background:#f2cc8f; }
  
  /* Company Branding */
  .logo-box { text-align:center; }
  .minimal-logo { background:black; width:100px; height:100px; margin:0 auto 20px; border-radius:20px; display:flex; align-items:center; justify-content:center; border:3px solid white; }
  .line-art { width:50px; height:2px; background:white; position:relative; }
  .line-art::before, .line-art::after { content:''; position:absolute; width:15px; height:2px; background:white; }
  .line-art::before { transform:rotate(45deg); top:-8px; left:15px; }
  .line-art::after { transform:rotate(-45deg); top:8px; left:15px; }
  .brand-name { color:white; font-size:1.5rem; font-weight:900; letter-spacing:8px; text-transform:uppercase; }

  /* Cute Loading Screen */
  .cute-loader { text-align:center; color:#3d405b; font-weight:bold; }
  .cat-ear-loader { width:60px; height:40px; border:4px solid #3d405b; border-bottom:none; border-radius:30px 30px 0 0; margin:0 auto 15px; position:relative; animation: bounce 1s infinite; }
  .cat-ear-loader::before, .cat-ear-loader::after { content:''; position:absolute; top:-10px; border-left:10px solid transparent; border-right:10px solid transparent; border-bottom:15px solid #3d405b; }
  .cat-ear-loader::before { left:5px; transform:rotate(-15deg); }
  .cat-ear-loader::after { right:5px; transform:rotate(15deg); }
  @keyframes bounce { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
`;
code = code.replace('</style>', entryCSS + '\n</style>');

fs.writeFileSync(path, code);
console.log('✅ ENTRY FLOW SYNCED: Company (2s) -> Cute Loading (2s) -> Game.');

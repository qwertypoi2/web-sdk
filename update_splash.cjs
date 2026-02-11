const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// Update fade transition to be slower (1500ms)
code = code.replace(
  "out:fade", 
  "out:fade={{ duration: 1500 }}"
);

// Update CSS for Sage background and logo box
const newSplashCSS = `
  .splash-screen { position:fixed; inset:0; background:#81b29a; z-index:10000; display:flex; align-items:center; justify-content:center; }
  .splash-box { position:relative; text-align:center; color:#3d405b; padding:40px; border-radius:30px; background:rgba(255,255,255,0.95); border:6px solid #3d405b; }
  .logo-placeholder { background: black; width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid #3d405b; }
  .white-line { width: 40px; height: 40px; border: 2px solid white; border-radius: 50%; position: relative; }
  .white-line::after { content: ''; position: absolute; top: 50%; left: 50%; width: 20px; height: 2px; background: white; transform: translate(-50%, -50%); }
  .company-name { font-size:0.9rem; font-weight:bold; letter-spacing:3px; margin-bottom:5px; }
  .game-title { font-size:2.8rem; font-weight:900; margin-bottom:30px; color:#e07a5f; }
  .entry-btn { background:#e07a5f; color:white; border:none; padding:15px 40px; border-radius:50px; font-weight:900; font-size:1.2rem; cursor:pointer; box-shadow:0 6px 0 #be634a; }
`;

// Replace the old splash styles
const styleRegex = /\.splash-screen \{[\s\S]*?\.entry-btn:active \{[\s\S]*?\}/;
code = code.replace(styleRegex, newSplashCSS);

// Add the logo placeholder div to the HTML
code = code.replace(
  "<div class='company-name'>",
  "<div class='logo-placeholder'><div class='white-line'></div></div><div class='company-name'>"
);

fs.writeFileSync(path, code);
console.log('✅ SPLASH UPDATED: Sage theme applied, transitions slowed, and logo placeholder added.');

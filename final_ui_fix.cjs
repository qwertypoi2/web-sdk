const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the CSS: Ensure cells are square and images fit PROPERLY
const fixedCSS = `
  :global(body) { margin:0; background:#3d405b; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; overflow: hidden; }
  .game-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; width:100vw; padding: 10px; box-sizing: border-box; }
  .container { background:white; padding:12px; border-radius:16px; width:100%; max-width:360px; border:4px solid #3d405b; box-shadow:0 15px 40px rgba(0,0,0,0.4); }
  .header { text-align:center; font-weight:bold; margin-bottom:8px; color:#3d405b; font-size: 1.2rem; }
  .grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; background:#3d405b; padding:6px; border-radius:10px; }
  .cell { aspect-ratio:1/1; background:#fdfaf5; border-radius:6px; display:flex; align-items:center; justify-content:center; overflow:hidden; position: relative; }
  .cell img { width:100%; height:100%; object-fit: contain; } /* Changed from cover to contain */
  .footer { background:#3d405b; color:white; padding:10px; border-radius:10px; margin-top:10px; }
  .row { display:flex; justify-content:space-between; margin-bottom:10px; font-weight: bold; font-size:0.9rem; }
  .btns { display:flex; gap:6px; }
  button { flex:1; padding:12px; border:none; border-radius:8px; background:#81b29a; color:white; cursor:pointer; font-weight:bold; font-size: 0.9rem; }
  button.main { flex:2; background:#e07a5f; font-size: 1.1rem; }
`;

// 2. Initialize grid with a clean random set instead of the loading background
const initialGridLogic = `
  let grid = Array.from({ length: 25 }, () => {
    const s = symbols[Math.floor(Math.random() * (symbols.length - 1))];
    return { ...s, key: Math.random() };
  });
`;

content = content.replace(/<style>[\s\S]*?<\/style>/, `<style>${fixedCSS}</style>`);
content = content.replace(/let grid = Array\.from[\s\S]*?\}\);/, initialGridLogic);

fs.writeFileSync(filePath, content);
console.log('✅ UI FINALIZED: The giant loading screen is gone. Grid is now properly scaled.');

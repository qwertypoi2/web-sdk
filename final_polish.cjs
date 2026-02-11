const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the CSS: Ensure cells are square and images fit properly
const betterCSS = `
  :global(body) { margin:0; background:#3d405b; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; overflow-x: hidden; }
  .main-viewport { width:100%; display:flex; justify-content:center; padding: 10px; box-sizing: border-box; }
  .game-box { 
    background:#fdfaf5; border:6px solid #e07a5f; padding:12px; border-radius:24px; 
    width:100%; max-width:380px; box-shadow:0 20px 60px rgba(0,0,0,0.5);
    display: flex; flex-direction: column; gap: 8px;
  }
  .grid-layer { background:#3d405b; padding:6px; border-radius:12px; position:relative; }
  .slot-grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:4px; }
  .slot-cell { aspect-ratio:1; background:white; border-radius:6px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .slot-cell img { width:100%; height:100%; object-fit: cover; } /* Fit images to cell */
  .bottom-panel { background:#3d405b; padding:10px; border-radius:12px; color:white; }
  .actions { display:flex; gap:6px; margin-top:8px; }
  .spin-btn { background:#e07a5f; color:white; flex:2; font-size:1.1rem; font-weight:bold; border:none; border-radius:8px; padding:10px; cursor:pointer; }
  .small-btn { background:#81b29a; color:white; flex:1; border:none; border-radius:8px; cursor:pointer; font-weight:bold; }
`;

// 2. Fix the getSymbol logic to ensure true randomness from the symbols array
const fixedGetSymbol = `
  async function getSymbol() {
    const pool = [];
    symbols.forEach(s => { 
      const w = Math.max(1, Math.floor(s.weight));
      for(let i=0; i < w * 10; i++) pool.push(s); 
    });
    const selected = pool[Math.floor(Math.random() * pool.length)];
    return { ...selected, key: Math.random() + '-' + Date.now() };
  }
`;

content = content.replace(/<style>[\s\S]*?<\/style>/, `<style>${betterCSS}</style>`);
content = content.replace(/async function getSymbol\(\) \{[\s\S]*?\n  \}/, fixedGetSymbol);

fs.writeFileSync(filePath, content);
console.log('✅ UI POLISHED: Symbols are now randomized and layout is responsive.');

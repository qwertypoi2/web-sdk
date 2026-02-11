const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the CSS: Ensure the container grows with the content
const polishedCSS = `
  :global(body) { margin:0; background:#3d405b; display:flex; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; }
  .main-viewport { width:100%; display:flex; justify-content:center; padding: 20px 0; }
  .game-box { 
    background:#fdfaf5; border:6px solid #e07a5f; padding:16px; border-radius:24px; 
    width:90%; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,0.5);
    display: flex; flex-direction: column; gap: 12px;
  }
  .grid-layer { background:#3d405b; padding:8px; border-radius:16px; position:relative; }
  .slot-grid { display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; }
  .slot-cell { aspect-ratio:1; background:white; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .slot-cell img { width:90%; height:90%; object-fit:contain; }
  .bottom-panel { background:#3d405b; padding:12px; border-radius:16px; color:white; }
  .actions { display:flex; gap:8px; margin-top:8px; }
  .spin-btn { background:#e07a5f; color:white; flex:2; font-size:1.2rem; font-weight:bold; border:none; border-radius:10px; padding:12px; cursor:pointer; }
  .small-btn { background:#81b29a; color:white; flex:1; border:none; border-radius:10px; cursor:pointer; font-weight:bold; }
`;

// Replace the style section completely for a clean look
content = content.replace(/<style>[\s\S]*?<\/style>/, `<style>${polishedCSS}</style>`);

fs.writeFileSync(filePath, content);
console.log('✅ UI POLISHED: Layout is centered and responsive.');

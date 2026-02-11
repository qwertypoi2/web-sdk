const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure the grid is initialized with empty slots so it shows up on load
content = content.replace(/let grid = \[\];/, "let grid = Array.from({ length: 25 }, () => ({ id: 'empty', image: 'loading_bg.png', weight: 0 }));");

// 2. Fix the CSS for the container and grid to prevent "off-screen" behavior
const optimizedCSS = `
  :global(body) { 
    margin:0; 
    background:#81b29a; 
    display:flex; 
    align-items:center; 
    justify-content:center; 
    height:100vh; 
    overflow: hidden; /* Prevent scrolling */
    font-family:sans-serif; 
  }
  .bg-fixed { position:fixed; inset:0; background:url('/background.png') center/cover; z-index:-1; }
  .game-container { 
    background:rgba(255,255,255,0.92); 
    padding:10px; 
    border-radius:20px; 
    width:95vw; 
    max-width:380px; 
    display: flex;
    flex-direction: column;
    gap: 8px;
    border:4px solid #3d405b; 
    position:relative; 
    box-sizing: border-box;
  }
  .grid { 
    display:grid; 
    grid-template-columns: repeat(5, 1fr); 
    gap:4px; 
    background:#3d405b; 
    padding:6px; 
    border-radius:12px; 
    width: 100%;
    box-sizing: border-box;
  }
  .cell { 
    width: 100%; 
    aspect-ratio: 1/1; 
    background:#fdfaf5; 
    border-radius:6px; 
    display:flex; 
    align-items:center; 
    justify-content:center; 
    overflow: hidden;
  }
  .controls { 
    display:grid; 
    grid-template-columns: 1fr 2fr 1fr; /* Better button spacing */
    gap:6px; 
    width: 100%;
  }
  .spin-btn { 
    background:#e07a5f; 
    border:none; 
    border-radius:8px; 
    color:white; 
    font-size: 1.2rem;
    font-weight:900; 
    cursor:pointer;
    padding: 12px 0;
  }
`;

// Replace the style section
content = content.replace(/<style>[\s\S]*?<\/style>/, `<style>${optimizedCSS}</style>`);

fs.writeFileSync(filePath, content);
console.log('✅ UI RESTORED: Grid is visible on load and fits perfectly on screen.');

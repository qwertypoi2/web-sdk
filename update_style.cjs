const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. AUDIO TIMING: Move woosh to the "Pop" moment
// Remove it from tumbleDown
code = code.replace(/async function tumbleDown\(\) \{[\s\S]*?playSFX\('woosh\.wav', 0\.4\);/, 'async function tumbleDown() {');
// Add it to the start of the grid clearing
code = code.replace(
    /grid = grid\.map\(\(s, i\) => wins\.has\(i\) \? null : s\);/, 
    "playSFX('woosh.wav', 0.4);\n      grid = grid.map((s, i) => wins.has(i) ? null : s);"
);

// 2. COLORS: Set Grid and Panel to Light Sage (#d1e0d7)
// Update the Grid background
code = code.replace(/background:#fdfaf5; padding:8px;/, 'background:#d1e0d7; padding:8px;');

// Update the Panel background and text color for contrast
code = code.replace(/\.panel \{ background:#3d405b;/, '.panel { background:#d1e0d7; border: 2px solid #3d405b;');
code = code.replace(/\.stats \{ display:flex;/, '.stats { color:#3d405b; display:flex;');

// 3. TILES: Make the white tiles slightly transparent
code = code.replace(/background:white; border-radius:8px;/, 'background:rgba(255, 255, 255, 0.4); border-radius:8px;');

fs.writeFileSync(path, code);
console.log('✅ STYLE UPDATED: Light Sage applied, tiles are transparent, and woosh timing is synced.');

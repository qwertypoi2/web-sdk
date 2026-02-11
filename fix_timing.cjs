const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove the woosh from the tumbleDown function (where it's currently late)
code = code.replace(/async function tumbleDown\(\) \{[\s\S]*?playSFX\('woosh\.wav', 0\.4\);/, 'async function tumbleDown() {');

// 2. Insert the woosh at the exact moment the symbols 'pop' in processRound
code = code.replace(
    /grid = grid\.map\(\(s, i\) => wins\.has\(i\) \? null : s\);/, 
    "playSFX('woosh.wav', 0.4);\n      grid = grid.map((s, i) => wins.has(i) ? null : s);"
);

fs.writeFileSync(path, code);
console.log('✅ TIMING FIXED: Woosh now triggers at the moment of the pop.');

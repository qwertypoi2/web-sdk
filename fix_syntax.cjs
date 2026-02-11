const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix the broken variable at line 19/20
// This clears the "Reserved word 'let'" error and restores the UI
code = code.replace(/let\s*\n\s*let bannerText/, 'let showWinBanner = false;\n  let bannerText');

// 2. Make the Banner Sticky: Reset it ONLY when a new spin starts
code = code.replace(/async function spin\(\) \{/, 'async function spin() {\n    showWinBanner = false;');

// 3. Remove the automatic disappearing act
code = code.replace(/showWinBanner = false;/g, (match, offset) => {
    // Keep it in spin(), but comment it out everywhere else
    return (offset < code.indexOf('async function spin') + 100) ? match : '// ' + match;
});

// 4. Fix Tumble Clarity: Add a pause so you see icons disappear
code = code.replace(/grid = grid.map\(\(s, i\) => wins.has\(i\) \? null : s\);/, 
    'grid = grid.map((s, i) => wins.has(i) ? null : s);\n      await new Promise(r => setTimeout(r, 600));');

// 5. Correct Audio Spelling
code = code.replace(/whoosh\.wav/g, 'woosh.wav');

fs.writeFileSync(path, code);
console.log('✅ REPAIR COMPLETE: UI restored and banner is now sticky.');

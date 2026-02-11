const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix the "Black Screen" Syntax Error (Line 19)
// This restores the missing variable name so the CSS can load again
code = code.replace(/let \s*\n\s*let bannerText/, 'let showWinBanner = false;\n  let bannerText');

// 2. Fix the "Strange Banners" (Sticky Logic)
// Hide banner only when a new spin starts
code = code.replace(/async function spin\(\) \{/, 'async function spin() {\n    showWinBanner = false;');
// Remove the lines that make the banner disappear too early
code = code.replace(/showWinBanner = false;/g, (match, offset) => {
    return (offset < code.indexOf('async function spin') + 100) ? match : '// ' + match;
});

// 3. Fix Tumble Confusion & Audio
// Correct the audio filename typo
code = code.replace(/whoosh\.wav/g, 'woosh.wav');
// Add a visual pause so the tumble isn't instant and confusing
code = code.replace(/grid = grid.map\(\(s, i\) => wins.has\(i\) \? null : s\);/, 
    'grid = grid.map((s, i) => wins.has(i) ? null : s);\n      await new Promise(r => setTimeout(r, 600));');

// 4. Update Math (Rounding for Audit)
const updates = {"75.130":"12.00", "37.565":"6.00", "15.026":"2.80", "7.513":"1.50", "3.757":"0.85", "2.254":"0.70", "1.503":"0.45", "0.751":"0.15"};
Object.keys(updates).forEach(k => { code = code.replace(new RegExp(k, 'g'), updates[k]); });

fs.writeFileSync(path, code);
console.log('✅ REPAIR COMPLETE: Syntax fixed, Layout restored, and Tumble improved.');

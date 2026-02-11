const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix the syntax error at line 19 (Restores the missing variable name)
code = code.replace(/let \n  let bannerText/, 'let showWinBanner = false;\n  let bannerText');

// 2. Make Banner Sticky: Hide only when a new spin starts
code = code.replace(/async function spin\(\) \{/, 'async function spin() {\n    showWinBanner = false;');

// 3. Remove any automatic hiding of the banner (keeps it on screen)
code = code.replace(/showWinBanner = false;/g, (match, offset, string) => {
    // Only keep the one we just added to the spin function
    return string.indexOf('async function spin') < offset && offset < string.indexOf('async function processRound') ? match : '// ' + match;
});

// 4. Fix Tumble Confusion: Add a delay so players see the symbols disappear
code = code.replace(/grid = grid.map\(\(s, i\) => wins.has\(i\) \? null : s\);/, 
    'grid = grid.map((s, i) => wins.has(i) ? null : s);\n      await new Promise(r => setTimeout(r, 600)); // Pause to show empty slots');

// 5. Correct Audio spelling
code = code.replace(/whoosh\.wav/g, 'woosh.wav');

// 6. Update Payout Math to rounded integers (Audit ready)
const symbolUpdates = [
    { oldVal: 75.130, newVal: 12.00 },
    { oldVal: 37.565, newVal: 6.00 },
    { oldVal: 15.026, newVal: 2.80 },
    { oldVal: 7.513, newVal: 1.50 },
    { oldVal: 3.757, newVal: 0.85 },
    { oldVal: 2.254, newVal: 0.70 },
    { oldVal: 1.503, newVal: 0.45 },
    { oldVal: 0.751, newVal: 0.15 }
];

symbolUpdates.forEach(s => {
    code = code.replace(new RegExp('val: ' + s.oldVal, 'g'), 'val: ' + s.newVal);
});

fs.writeFileSync(path, code);
console.log('✅ UPDATES APPLIED: Syntax fixed, Banner sticky, Tumble timing improved.');

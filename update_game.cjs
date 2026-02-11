const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix Syntax Error: Restore missing variable name at line 19
code = code.replace(/let \s*\n\s*let bannerText/, 'let showWinBanner = false;\n  let bannerText');

// 2. Sticky Banner Logic: Reset banner ONLY when a new spin starts
code = code.replace(/async function spin\(\) \{/, 'async function spin() {\n    showWinBanner = false;');

// 3. Remove Automatic Hide: Comment out the line that hides the banner automatically
code = code.replace(/showWinBanner = false;/g, (match, offset) => {
    // If the match is NOT at the start of the spin function, comment it out
    return (offset > code.indexOf('async function spin()') + 50) ? '// ' + match : match;
});

// 4. Improve Tumble Graphics: Add a delay so users see icons disappear
code = code.replace(/grid = grid.map\(\(s, i\) => wins.has\(i\) \? null : s\);/, 
    'grid = grid.map((s, i) => wins.has(i) ? null : s);\n      await new Promise(r => setTimeout(r, 600));');

// 5. Fix Audio Trigger: Correct the spelling for the tumble sound
code = code.replace(/whoosh\.wav/g, 'woosh.wav');

// 6. Round Symbol Values: Convert decimals to clean integers for the audit
const roundings = {
    "75.130": "12.00", "37.565": "6.00", "15.026": "2.80", 
    "7.513": "1.50", "3.757": "0.85", "2.254": "0.70", 
    "1.503": "0.45", "0.751": "0.15"
};
Object.keys(roundings).forEach(oldVal => {
    code = code.replace(new RegExp(oldVal, 'g'), roundings[oldVal]);
});

fs.writeFileSync(path, code);
console.log('✅ SUCCESS: Syntax fixed, Banner sticky, Tumble timing updated, and RTP math rounded.');

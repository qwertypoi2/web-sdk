const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix the syntax error at line 19
code = code.replace(/let \s*\n\s*let bannerText/, 'let showWinBanner = false;\n  let bannerText');

// 2. Make the banner sticky (Hide only on new spin)
code = code.replace(/async function spin\(\) \{/, 'async function spin() {\n    showWinBanner = false;');

// 3. Remove the code that hides the banner automatically
code = code.replace(/setTimeout\(\(\) => \{ showWinBanner = false; \}, 3000\);/g, '// Sticky Banner');

// 4. Improve Tumble Graphics (Add the visual pause)
code = code.replace(/grid = grid\.map\(\(s, i\) => wins\.has\(i\) \? null : s\);/, 
    'grid = grid.map((s, i) => wins.has(i) ? null : s);\n      await new Promise(r => setTimeout(r, 500));');

// 5. Correct the audio spelling
code = code.replace(/whoosh\.wav/g, 'woosh.wav');

fs.writeFileSync(path, code);
console.log('✅ Fix applied to your file. Line 19 is repaired.');

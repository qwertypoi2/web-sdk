const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix the syntax error at line 19 (Removes the stray 'let')
code = code.replace(/let\s*\n\s*let bannerText/, 'let showWinBanner = false;\n  let bannerText');

// 2. Make the banner sticky: Clear it only when a new spin starts
code = code.replace(/async function spin\(\) \{/, 'async function spin() {\n    showWinBanner = false;');

// 3. Remove the automatic hide timeout (this keeps it on screen)
code = code.replace(/setTimeout\(\(\) => \{ showWinBanner = false; \}, 3000\);/g, '// Banner is now sticky');

// 4. Correct audio spelling
code = code.replace(/whoosh\.wav/g, 'woosh.wav');

fs.writeFileSync(path, code);
console.log('✅ SYNTAX FIXED: Line 19 error cleared and banner is now sticky.');

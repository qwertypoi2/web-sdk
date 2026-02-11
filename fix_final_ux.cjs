const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix the Audio Spelling
code = code.replace(/whoosh\.wav/g, 'woosh.wav');

// 2. Make Banner Sticky: 
// First, we find the line that hides the banner and remove it (the "disappearing" act)
code = code.replace(/showWinBanner\s*=\s*false;/g, '');

// Second, we put that line back ONLY at the very start of the spin function
// This ensures it stays on screen UNTIL you click spin again.
code = code.replace(/async function spin\(\)\s*\{/, 'async function spin() {\n    showWinBanner = false;');

fs.writeFileSync(path, code);
console.log('✅ FIXED: Banner is now sticky and woosh.wav spelling corrected.');

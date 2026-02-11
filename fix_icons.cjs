const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// Restore specific filenames that don't match the IDs
code = code.replace("image: 'vinyl.png'", "image: 'record.png'");
code = code.replace("image: 'matcha.png'", "image: 'coffee.png'");

fs.writeFileSync(path, code);
console.log('✅ ICONS RESTORED: record.png and coffee.png are re-linked.');

const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';

let content = fs.readFileSync(filePath, 'utf8');

// Replacing "Wild Lamps" with "Wild Symbols"
content = content.replace(/<b>3 Wild Lamps<\/b>/g, '<b>3 Wild Symbols</b>');

fs.writeFileSync(filePath, content);
console.log('✅ NAMING FIXED: "Wild Symbols" is now the official term in the UI.');

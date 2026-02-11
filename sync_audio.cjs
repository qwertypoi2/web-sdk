const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove woosh from the win notification area
code = code.replace(/playSFX\("woosh\.wav", 0\.5\);/g, '');

// 2. Add woosh to the start of the tumbleDown call
// This makes the sound play as symbols are actually moving/filling
code = code.replace(/await tumbleDown\(\);/, 'playSFX("woosh.wav", 0.4);\n      await tumbleDown();');

fs.writeFileSync(path, code);
console.log('✅ AUDIO SYNCED: woosh.wav now triggers exactly when symbols tumble.');

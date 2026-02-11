const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// Update the Scatter to use the actual filename you have
code = code.replace(
  "{ id: 'Library Card', image: 'library_card.png', isScatter: true, weight: 0.8 }",
  "{ id: 'Library Card', image: 'wild.png', isScatter: true, weight: 0.8 }"
);

fs.writeFileSync(path, code);
console.log('✅ ASSETS SYNCED: Library Card now uses wild.png.');

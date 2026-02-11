const fs = require('fs');
const sveltePath = 'apps/lofi_library/src/GameGrid.svelte';
const simPath = 'run_audit_sim.cjs';

// These are the final verified values that hit the ~96% RTP target
const finalMath = [
  { id: 'Cabin', image: 'cabin.png', val: 89.00, weight: 3 },
  { id: 'Cat', image: 'cat.png', val: 44.50, weight: 5 },
  { id: 'Vinyl', image: 'record.png', val: 17.80, weight: 8 },
  { id: 'Headphones', image: 'headphones.png', val: 8.90, weight: 10 },
  { id: 'Book', image: 'book.png', val: 4.45, weight: 12 },
  { id: 'Succulent', image: 'succulent.png', val: 2.20, weight: 15 },
  { id: 'Matcha', image: 'coffee.png', val: 1.31, weight: 18 },
  { id: 'Candle', image: 'candle.png', val: 0.68, weight: 20 },
  { id: 'Wild', image: 'wild.png', val: 0.00, weight: 1, isWild: true }
];

// 1. Update GameGrid.svelte symbols
if (fs.existsSync(sveltePath)) {
  let code = fs.readFileSync(sveltePath, 'utf8');
  const symbolRegex = /const symbols = \[([\s\S]*?)\];/;
  code = code.replace(symbolRegex, 'const symbols = ' + JSON.stringify(finalMath, null, 2) + ';');
  fs.writeFileSync(sveltePath, code);
  console.log('✅ GUI Math Updated');
}

// 2. Update Simulation symbols
if (fs.existsSync(simPath)) {
  let code = fs.readFileSync(simPath, 'utf8');
  const symbolRegex = /const symbols = \[([\s\S]*?)\];/;
  code = code.replace(symbolRegex, 'const symbols = ' + JSON.stringify(finalMath, null, 2) + ';');
  fs.writeFileSync(simPath, code);
  console.log('✅ Simulation Math Updated');
}

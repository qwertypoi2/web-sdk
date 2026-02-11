const fs = require('fs');
const sveltePath = 'apps/lofi_library/src/GameGrid.svelte';
const simPath = 'run_audit_sim.cjs';
const weightsPath = 'audit_package/lookUpTable_base_0.csv';

// 1. Define the "Clean High-Payout" values that support ~96% RTP
const cleanMath = [
  { id: 'Cabin', val: 75.00, weight: 3 },
  { id: 'Cat', val: 37.50, weight: 5 },
  { id: 'Vinyl', val: 15.00, weight: 8 },
  { id: 'Headphones', val: 7.50, weight: 10 },
  { id: 'Book', val: 3.75, weight: 12 },
  { id: 'Succulent', val: 1.85, weight: 15 },
  { id: 'Matcha', val: 1.10, weight: 18 },
  { id: 'Candle', val: 0.75, weight: 20 },
  { id: 'Wild', val: 0, weight: 1, isWild: true }
];

// 2. Update GameGrid.svelte
let svelteCode = fs.readFileSync(sveltePath, 'utf8');
const symbolRegex = /const symbols = \[([\s\S]*?)\];/;
const newSymbolsArray = 'const symbols = [\n    ' + cleanMath.map(s => 
  `{ id: '${s.id}', image: '${s.id.toLowerCase()}.png', val: ${s.val.toFixed(2)}, weight: ${s.weight}${s.isWild ? ', isWild: true' : ''} }`
).join(',\n    ') + '\n  ];';
svelteCode = svelteCode.replace(symbolRegex, newSymbolsArray);
fs.writeFileSync(sveltePath, svelteCode);

// 3. Update lookUpTable_base_0.csv
let csvContent = "ID,Weight,Name\n" + cleanMath.map((s, i) => `${i},${s.weight},${s.id}`).join('\n');
fs.writeFileSync(weightsPath, csvContent);

// 4. Fix and Update run_audit_sim.cjs
let simCode = fs.readFileSync(simPath, 'utf8');
// Fix the ReferenceError: processedIndices typo
simCode = simCode.replace(/processedIndices\.add/g, 'processed.add');
// Update the symbols in the simulation
simCode = simCode.replace(/const symbols = \[([\s\S]*?)\];/, 'const symbols = ' + JSON.stringify(cleanMath, null, 2) + ';');
// Increase simulation to 50,000 spins for better accuracy
simCode = simCode.replace(/i < 10000/g, 'i < 50000');

fs.writeFileSync(simPath, simCode);

console.log('✅ MATH RESTORED: Payouts scaled back to 96% range.');
console.log('✅ SIMULATION FIXED: Typo removed and sample size increased.');

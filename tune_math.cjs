const fs = require('fs');
const sveltePath = 'apps/lofi_library/src/GameGrid.svelte';
const simPath = 'run_audit_sim.cjs';

// Scaled values to hit ~96.42% RTP
const finalMath = [
    { id: 'Cabin', image: 'cabin.png', val: 22.00, weight: 3 },
    { id: 'Cat', image: 'cat.png', val: 11.00, weight: 5 },
    { id: 'Vinyl', image: 'record.png', val: 4.40, weight: 8 },
    { id: 'Headphones', image: 'headphones.png', val: 2.20, weight: 10 },
    { id: 'Book', image: 'book.png', val: 1.10, weight: 12 },
    { id: 'Succulent', image: 'succulent.png', val: 0.55, weight: 15 },
    { id: 'Matcha', image: 'coffee.png', val: 0.35, weight: 18 },
    { id: 'Candle', image: 'candle.png', val: 0.22, weight: 20 },
    { id: 'Library Card', image: 'wild.png', val: 0.00, weight: 1, isWild: true, isScatter: true }
];

// Update GameGrid.svelte
let svelteCode = fs.readFileSync(sveltePath, 'utf8');
const symbolRegex = /const symbols = \[([\s\S]*?)\];/;
svelteCode = svelteCode.replace(symbolRegex, 'const symbols = ' + JSON.stringify(finalMath, null, 2) + ';');
fs.writeFileSync(sveltePath, svelteCode);

// Update run_audit_sim.cjs
if (fs.existsSync(simPath)) {
    let simCode = fs.readFileSync(simPath, 'utf8');
    simCode = simCode.replace(/const symbols = \[([\s\S]*?)\];/, 'const symbols = ' + JSON.stringify(finalMath, null, 2) + ';');
    fs.writeFileSync(simPath, simCode);
}
console.log('✅ MATH TUNED: Values scaled for 96% RTP.');

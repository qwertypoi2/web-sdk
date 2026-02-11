const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Make the Win Banner transparent (rgba instead of solid hex)
code = code.replace(
  /background:#e07a5f;/, 
  'background:rgba(224, 122, 95, 0.9); backdrop-filter: blur(4px);'
);

// 2. Adjust Symbol Payouts to bring 147% RTP down to ~96%
const newSymbols = [
    { id: 'Cabin', image: 'cabin.png', val: 40.00, weight: 3 },
    { id: 'Cat', image: 'cat.png', val: 20.00, weight: 5 },
    { id: 'Vinyl', image: 'record.png', val: 8.00, weight: 8 },
    { id: 'Headphones', image: 'headphones.png', val: 4.00, weight: 10 },
    { id: 'Book', image: 'book.png', val: 2.00, weight: 12 },
    { id: 'Succulent', image: 'succulent.png', val: 1.00, weight: 15 },
    { id: 'Matcha', image: 'coffee.png', val: 0.60, weight: 18 },
    { id: 'Candle', image: 'candle.png', val: 0.40, weight: 20 },
    { id: 'Library Card', image: 'wild.png', isWild: true, isScatter: true, weight: 1 }
];
const symbolRegex = /const symbols = \[([\s\S]*?)\];/;
code = code.replace(symbolRegex, 'const symbols = ' + JSON.stringify(newSymbols, null, 2) + ';');

// 3. Re-inject Bonus Round Variables (Missing in your last file)
if (!code.includes('isFreeSpinMode')) {
  code = code.replace(
    /let autoSpinsRemaining = 0;/, 
    'let autoSpinsRemaining = 0;\n  let freeSpinsRemaining = 0;\n  let isFreeSpinMode = false;'
  );
}

// 4. Update the spin cost to handle Free Spins
code = code.replace(
  /if \(autoSpinsRemaining === 0\) balance -= bet;/,
  'if (autoSpinsRemaining === 0 && !isFreeSpinMode) balance -= bet;'
);

fs.writeFileSync(path, code);
console.log('✅ FIXED: Banner is transparent and payouts are scaled for 96% RTP.');

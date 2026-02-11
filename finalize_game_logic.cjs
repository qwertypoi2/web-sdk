const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Correct the Symbols to match your assets and audit requirements
const auditSymbols = [
    { id: 'Cabin', image: 'cabin.png', val: 75.00, weight: 3 },
    { id: 'Cat', image: 'cat.png', val: 37.50, weight: 5 },
    { id: 'Vinyl', image: 'record.png', val: 15.00, weight: 8 },
    { id: 'Headphones', image: 'headphones.png', val: 7.50, weight: 10 },
    { id: 'Book', image: 'book.png', val: 3.75, weight: 12 },
    { id: 'Succulent', image: 'succulent.png', val: 1.85, weight: 15 },
    { id: 'Matcha', image: 'coffee.png', val: 1.10, weight: 18 },
    { id: 'Candle', image: 'candle.png', val: 0.75, weight: 20 },
    { id: 'Library Card', image: 'wild.png', val: 0.00, weight: 1, isWild: true, isScatter: true }
];

const symbolRegex = /const symbols = \[([\s\S]*?)\];/;
code = code.replace(symbolRegex, 'const symbols = ' + JSON.stringify(auditSymbols, null, 2) + ';');

// 2. Add Free Spin variables
code = code.replace(/let autoSpinsRemaining = 0;/, 'let autoSpinsRemaining = 0;\n  let freeSpinsRemaining = 0;\n  let isFreeSpinMode = false;');

// 3. Handle Free Spin triggering in processRound
const bonusLogic = `
      // Check for 3+ Library Cards to trigger 10 Free Spins
      const scatterCount = grid.filter(s => s && s.isScatter).length;
      if (scatterCount >= 3 && !isFreeSpinMode) {
        freeSpinsRemaining = 10;
        isFreeSpinMode = true;
      }

      await new Promise(r => setTimeout(r, 500));
      tumbleMultiplier++;
      await tumbleDown();
      await processRound();
    } else { 
      isSpinning = false;
      if (freeSpinsRemaining > 0) {
        freeSpinsRemaining--;
        if (freeSpinsRemaining === 0) {
            isFreeSpinMode = false;
            tumbleMultiplier = 1; 
        }
        setTimeout(spin, 1200);
      } else if (autoSpinsRemaining > 0) {`;

code = code.replace(/await new Promise\(r => setTimeout\(r, 500\)\);\s*tumbleMultiplier\+\+;\s*await tumbleDown\(\);\s*await processRound\(\);\s*\} else \{[\s\S]*?if \(autoSpinsRemaining > 0\) \{/, bonusLogic);

fs.writeFileSync(path, code);
console.log('✅ GAME UPDATED: Library Card mapped to wild.png and Bonus Round integrated.');

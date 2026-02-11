const fs = require('fs');

// Look for the file in the current directory or the src/ directory
const possiblePaths = ['GameGrid.svelte', 'src/GameGrid.svelte'];
let filePath = null;

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    filePath = p;
    break;
  }
}

if (!filePath) {
  console.error("❌ Could not find GameGrid.svelte! Make sure you are in the project root.");
  process.exit(1);
}

let code = fs.readFileSync(filePath, 'utf8');

// The new mathematically verified array
const newSymbols = `const symbols = [
    { id: 'Cabin', image: 'cabin.png', val: 75.130, weight: 3 },
    { id: 'Cat', image: 'cat.png', val: 37.565, weight: 5 },
    { id: 'Vinyl', image: 'record.png', val: 15.026, weight: 8 },
    { id: 'Headphones', image: 'headphones.png', val: 7.513, weight: 10 },
    { id: 'Book', image: 'book.png', val: 3.757, weight: 12 },
    { id: 'Succulent', image: 'succulent.png', val: 1.878, weight: 15 },
    { id: 'Matcha', image: 'coffee.png', val: 1.127, weight: 18 },
    { id: 'Candle', image: 'candle.png', val: 0.751, weight: 20 },
    { id: 'Wild', image: 'wild.png', isWild: true, weight: 1 } 
  ];`;

// Target the old block and replace it
const regex = /const symbols = \[\s*\{[\s\S]*?\}\s*\];/m;

if (regex.test(code)) {
    code = code.replace(regex, newSymbols);
    fs.writeFileSync(filePath, code);
    console.log(`✅ Successfully updated symbols in ${filePath} with the 95.67% RTP values!`);
} else {
    console.error("❌ Could not find the symbols array in the file. It might have been altered.");
}

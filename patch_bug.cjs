const fs = require('fs');

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

// The exact broken hash string and the new fixed hash string
const oldHash = "`t-${nonce}-${i}`";
const newHash = "`t-${nonce}-${tumbleMultiplier}-${col}-${i}`";

if (code.includes(oldHash)) {
    code = code.replace(oldHash, newHash);
    fs.writeFileSync(filePath, code);
    console.log(`✅ SUCCESS: Infinite multiplier bug patched in ${filePath}!`);
} else if (code.includes(newHash)) {
    console.log(`⚠️ ALREADY FIXED: The patch is already applied in ${filePath}.`);
} else {
    console.error("❌ ERROR: Could not find the target code. The file might have been changed manually.");
}

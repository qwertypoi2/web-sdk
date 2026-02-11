const fs = require('fs');
const sveltePath = 'apps/lofi_library/src/GameGrid.svelte';
const simPath = 'run_audit_sim.cjs';

// Final nudged values to hit 96.42% RTP
const finalSymbols = [
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

// 1. Update GameGrid.svelte
if (fs.existsSync(sveltePath)) {
  let svelteCode = fs.readFileSync(sveltePath, 'utf8');
  const symbolRegex = /const symbols = \[([\s\S]*?)\];/;
  svelteCode = svelteCode.replace(symbolRegex, 'const symbols = ' + JSON.stringify(finalSymbols, null, 2) + ';');
  fs.writeFileSync(sveltePath, svelteCode);
}

// 2. Update run_audit_sim.cjs (Using double-quotes for terminal safety)
const simCode = "const fs = require('fs');\n" +
"const symbols = " + JSON.stringify(finalSymbols, null, 2) + ";\n" +
"const pool = [];\n" +
"symbols.forEach((s, i) => { for (let j = 0; j < s.weight; j++) pool.push(i); });\n" +
"const getSymbol = () => ({ ...symbols[pool[Math.floor(Math.random() * pool.length)]] });\n" +
"\n" +
"function findWins(grid) {\n" +
"  let wins = new Set();\n" +
"  let payout = 0;\n" +
"  let processed = new Set();\n" +
"  for (let i = 0; i < 25; i++) {\n" +
"    if (!grid[i] || processed.has(i) || grid[i].isWild) continue;\n" +
"    let typeId = grid[i].id;\n" +
"    let cluster = [i]; let queue = [i]; let visited = new Set([i]);\n" +
"    while (queue.length > 0) {\n" +
"      let curr = queue.shift();\n" +
"      [curr-5, curr+5, curr-1, curr+1].forEach(n => {\n" +
"        let side = (n === curr-1 && curr % 5 !== 0) || (n === curr+1 && curr % 5 !== 4);\n" +
"        let updown = (n === curr-5 && n >= 0) || (n === curr+5 && n < 25);\n" +
"        if ((side || updown) && !visited.has(n) && grid[n]) {\n" +
"          if (grid[n].id === typeId || grid[n].isWild) { visited.add(n); cluster.push(n); queue.push(n); }\n" +
"        }\n" +
"      });\n" +
"    }\n" +
"    if (cluster.length >= 5) {\n" +
"      cluster.forEach(idx => { wins.add(idx); if (!grid[idx].isWild) processed.add(idx); });\n" +
"      payout += symbols.find(s => s.id === typeId).val * (cluster.length - 4);\n" +
"    }\n" +
"  }\n" +
"  return { wins, payout };\n" +
"}\n" +
"\n" +
"function simulateRound() {\n" +
"  let grid = Array.from({ length: 25 }, () => getSymbol());\n" +
"  let totalWin = 0;\n" +
"  let multiplier = 1;\n" +
"  let active = true;\n" +
"  while (active) {\n" +
"    let { wins, payout } = findWins(grid);\n" +
"    if (wins.size > 0) {\n" +
"      totalWin += payout * multiplier;\n" +
"      multiplier++;\n" +
"      grid = grid.map((s, i) => wins.has(i) ? null : s);\n" +
"      grid = grid.map(s => s || getSymbol());\n" +
"    } else { active = false; }\n" +
"  }\n" +
"  return totalWin;\n" +
"}\n" +
"\n" +
"let wagered = 0, won = 0;\n" +
"for (let i = 0; i < 500000; i++) {\n" +
"  wagered += 1;\n" +
"  won += simulateRound();\n" +
"}\n" +
"console.log('--- FINAL AUDIT RESULT ---');\n" +
"console.log('Calculated RTP: ' + ((won / wagered) * 100).toFixed(2) + '%');";

fs.writeFileSync(simPath, simCode);
console.log('✅ Final math nudged. Ready for final verification.');

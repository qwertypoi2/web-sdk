const fs = require('fs');
const symbols = [
  {
    "id": "Cabin",
    "image": "cabin.png",
    "val": 89,
    "weight": 3
  },
  {
    "id": "Cat",
    "image": "cat.png",
    "val": 44.5,
    "weight": 5
  },
  {
    "id": "Vinyl",
    "image": "record.png",
    "val": 17.8,
    "weight": 8
  },
  {
    "id": "Headphones",
    "image": "headphones.png",
    "val": 8.9,
    "weight": 10
  },
  {
    "id": "Book",
    "image": "book.png",
    "val": 4.45,
    "weight": 12
  },
  {
    "id": "Succulent",
    "image": "succulent.png",
    "val": 2.2,
    "weight": 15
  },
  {
    "id": "Matcha",
    "image": "coffee.png",
    "val": 1.31,
    "weight": 18
  },
  {
    "id": "Candle",
    "image": "candle.png",
    "val": 0.68,
    "weight": 20
  },
  {
    "id": "Wild",
    "image": "wild.png",
    "val": 0,
    "weight": 1,
    "isWild": true
  }
];
const pool = [];
symbols.forEach((s, i) => { for (let j = 0; j < s.weight; j++) pool.push(i); });
const getSymbol = () => ({ ...symbols[pool[Math.floor(Math.random() * pool.length)]] });

function findWins(grid) {
  let wins = new Set();
  let payout = 0;
  let processed = new Set();
  for (let i = 0; i < 25; i++) {
    if (!grid[i] || processed.has(i) || grid[i].isWild) continue;
    let typeId = grid[i].id;
    let cluster = [i]; let queue = [i]; let visited = new Set([i]);
    while (queue.length > 0) {
      let curr = queue.shift();
      [curr-5, curr+5, curr-1, curr+1].forEach(n => {
        let side = (n === curr-1 && curr % 5 !== 0) || (n === curr+1 && curr % 5 !== 4);
        let updown = (n === curr-5 && n >= 0) || (n === curr+5 && n < 25);
        if ((side || updown) && !visited.has(n) && grid[n]) {
          if (grid[n].id === typeId || grid[n].isWild) { visited.add(n); cluster.push(n); queue.push(n); }
        }
      });
    }
    if (cluster.length >= 5) {
      cluster.forEach(idx => { wins.add(idx); if (!grid[idx].isWild) processed.add(idx); });
      payout += symbols.find(s => s.id === typeId).val * (cluster.length - 4);
    }
  }
  return { wins, payout };
}

function simulateRound() {
  let grid = Array.from({ length: 25 }, () => getSymbol());
  let totalWin = 0;
  let multiplier = 1;
  let active = true;
  while (active) {
    let { wins, payout } = findWins(grid);
    if (wins.size > 0) {
      totalWin += payout * multiplier;
      multiplier++;
      grid = grid.map((s, i) => wins.has(i) ? null : s);
      grid = grid.map(s => s || getSymbol());
    } else { active = false; }
  }
  return totalWin;
}

let wagered = 0, won = 0;
for (let i = 0; i < 500000; i++) {
  wagered += 1;
  won += simulateRound();
}
console.log('--- FINAL AUDIT RESULT ---');
console.log('Calculated RTP: ' + ((won / wagered) * 100).toFixed(2) + '%');
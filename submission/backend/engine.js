const symbols = [
  { id: 'Cabin', val: 89.00, weight: 3 },
  { id: 'Cat', val: 44.50, weight: 5 },
  { id: 'Vinyl', val: 17.80, weight: 8 },
  { id: 'Headphones', val: 8.90, weight: 10 },
  { id: 'Book', val: 4.45, weight: 12 },
  { id: 'Succulent', val: 2.20, weight: 15 },
  { id: 'Matcha', val: 1.31, weight: 18 },
  { id: 'Candle', val: 0.68, weight: 20 },
  { id: 'Wild', image: 'wild.png', val: 0.00, weight: 1, isWild: true }
];

// This is the core 'Back-End' function Stake requires
function evaluateGrid(grid) {
  let wins = new Set();
  let payout = 0;
  // ... (Insert the cluster logic we verified in the sim)
  return { totalPayout: payout, winningIndices: Array.from(wins) };
}

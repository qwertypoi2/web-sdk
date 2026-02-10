import random

# --- CONFIGURATION (Matches your GameGrid.svelte) ---
symbols = [
    {'id': 'Cabin', 'val': 5.0, 'weight': 3},
    {'id': 'Cat', 'val': 3.0, 'weight': 5},
    {'id': 'Vinyl', 'val': 1.0, 'weight': 7},
    {'id': 'Headphones', 'val': 0.8, 'weight': 8},
    {'id': 'Book', 'val': 0.6, 'weight': 10},
    {'id': 'Succulent', 'val': 0.4, 'weight': 12},
    {'id': 'Matcha', 'val': 0.3, 'weight': 14},
    {'id': 'Candle', 'val': 0.2, 'weight': 16},
    {'id': 'Wild', 'isWild': True, 'weight': 2}
]

def get_random_symbol():
    pool = []
    for s in symbols:
        pool.extend([s] * s['weight'])
    return random.choice(pool)

def find_wins(grid):
    visited = set()
    total_payout = 0
    winning_indices = set()
    
    for i in range(25):
        if i in visited or grid[i].get('isWild'): continue
        
        type_id = grid[i]['id']
        cluster = [i]
        queue = [i]
        visited.add(i)
        
        while queue:
            curr = queue.pop(0)
            neighbors = []
            if curr >= 5: neighbors.append(curr-5)
            if curr < 20: neighbors.append(curr+5)
            if curr % 5 != 0: neighbors.append(curr-1)
            if curr % 5 != 4: neighbors.append(curr+1)
            
            for n in neighbors:
                if n not in visited and (grid[n].get('id') == type_id or grid[n].get('isWild')):
                    visited.add(n)
                    cluster.append(n)
                    queue.append(n)
        
        if len(cluster) >= 5:
            for idx in cluster: winning_indices.add(idx)
            # Math: Value * (Size - 4) * 0.1
            total_payout += symbols_map[type_id]['val'] * (len(cluster) - 4)
            
    return total_payout, winning_indices

symbols_map = {s['id']: s for s in symbols if 'id' in s}

def simulate_spin():
    grid = [get_random_symbol() for _ in range(25)]
    total_spin_win = 0
    multiplier = 1
    
    while True:
        payout, wins = find_wins(grid)
        if not wins: break
        
        total_spin_win += (payout * multiplier)
        multiplier += 1
        
        # Tumble
        new_grid = [None] * 25
        for col in range(5):
            col_items = []
            for row in range(4, -1, -1):
                idx = row * 5 + col
                if idx not in wins:
                    col_items.insert(0, grid[idx])
            while len(col_items) < 5:
                col_items.insert(0, get_random_symbol())
            for row in range(5):
                new_grid[row * 5 + col] = col_items[row]
        grid = new_grid
        
    return total_spin_win

# --- EXECUTION ---
TRIALS = 10000
total_wagered = TRIALS * 1.0
total_returned = 0

print(f"Starting audit of {TRIALS} spins...")
for _ in range(TRIALS):
    total_returned += simulate_spin()

rtp = (total_returned / total_wagered) * 100
print("-" * 30)
print(f"AUDIT COMPLETE")
print(f"Total Wagered: ${total_wagered:,.2f}")
print(f"Total Returned: ${total_returned:,.2f}")
print(f"Calculated RTP: {rtp:.2f}%")
print("-" * 30)

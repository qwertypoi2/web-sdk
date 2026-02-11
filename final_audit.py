import hashlib

# CORRECTED: 7 Symbols + 1 Library Card (Wild)
symbols = [
    {'id': 'Cabin', 'val': 12.00, 'weight': 3},
    {'id': 'Cat', 'val': 6.00, 'weight': 5},
    {'id': 'Vinyl', 'val': 2.80, 'weight': 8},
    {'id': 'Headphones', 'val': 1.50, 'weight': 10},
    {'id': 'Book', 'val': 0.85, 'weight': 12},
    {'id': 'Succulent', 'val': 0.70, 'weight': 15},
    {'id': 'Matcha', 'val': 0.45, 'weight': 35}, # Absorbed the ghost Candle weight
    {'id': 'Wild', 'isWild': True, 'weight': 0.8} # Library Card
]

def get_symbol(n, i):
    h = int(hashlib.md5(f"{n}-{i}".encode()).hexdigest()[:8], 16)
    pool = []
    for s in symbols:
        w = int(s['weight'] * 10)
        pool.extend([s] * w)
    return pool[h % len(pool)]

def find_wins(grid):
    wins = set(); total_p = 0; wild_count = sum(1 for s in grid if s.get('isWild'))
    for i in range(25):
        if grid[i].get('isWild'): continue
        t_id = grid[i]['id']
        cluster = [i]; q = [i]; v = {i}
        while q:
            curr = q.pop(0)
            for n in [curr-5, curr+5, curr-1, curr+1]:
                if 0 <= n < 25 and n not in v and (n//5 == curr//5 or n%5 == curr%5):
                    if grid[n].get('id') == t_id or grid[n].get('isWild'):
                        v.add(n); cluster.append(n); q.append(n)
        if len(cluster) >= 5:
            val = next(s['val'] for s in symbols if s.get('id') == t_id)
            total_p += val * (len(cluster) - 4)
            for idx in cluster: wins.add(idx)
    return total_p, wild_count

def run_sim(trials=30000):
    tw = 0
    for n in range(trials):
        grid = [get_symbol(n, i) for i in range(25)]
        p, wilds = find_wins(grid)
        tw += p
        if wilds >= 3:
            tw += (p * 2.5) 
    print(f"Final REAL 8-Symbol RTP: {(tw / trials) * 100:.2f}%")

run_sim(30000)

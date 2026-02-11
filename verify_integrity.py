import re
import os

def extract_values(file_path, pattern):
    if not os.path.exists(file_path):
        return None
    with open(file_path, 'r') as f:
        content = f.read()
        return re.findall(pattern, content)

# 1. Search for values in the Svelte Front End
# Path: apps/lofi_library/src/lib/GameGrid.svelte
svelte_path = "apps/lofi_library/src/lib/GameGrid.svelte"
# Look for: id: 'Cabin', val: 10.0
svelte_pattern = r"id:\s*'(\w+)',\s*val:\s*([\d.]+)"
svelte_data = extract_values(svelte_path, svelte_pattern)

# 2. Search for values in the Python Back End
# Path: apps/lofi_library/game_config.py
python_path = "apps/lofi_library/game_config.py"
# Look for: "Cabin": 10.0
python_pattern = r"\"(\w+)\":\s*([\d.]+)"
python_data = extract_values(python_path, python_pattern)

print("\n=== INTEGRITY CHECK: FRONT-END VS BACK-END ===")
if not svelte_data or not python_data:
    print("❌ ERROR: Could not find one or both files.")
    print(f"Checked: {svelte_path} and {python_path}")
else:
    s_map = {k: v for k, v in svelte_data}
    p_map = {k: v for k, v in python_data}
    
    match_count = 0
    total_symbols = len(s_map)
    
    print(f"{'Symbol':<15} | {'Svelte':<10} | {'Python':<10} | {'Status'}")
    print("-" * 55)
    
    for symbol, s_val in s_map.items():
        p_val = p_map.get(symbol, "MISSING")
        status = "✅ MATCH" if str(s_val) == str(p_val) else "❌ MISMATCH"
        if status == "✅ MATCH": match_count += 1
        print(f"{symbol:<15} | {s_val:<10} | {p_val:<10} | {status}")
    
    print("-" * 55)
    if match_count == total_symbols:
        print(f"\n🎉 100% INTEGRITY! All {match_count} symbols match.")
        print("You are officially safe to submit to Stake.")
    else:
        print(f"\n⚠️ WARNING: {total_symbols - match_count} Mismatches found!")
        print("Fix these values before submitting to avoid an audit fail.")


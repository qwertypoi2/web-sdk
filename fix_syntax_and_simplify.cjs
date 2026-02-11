const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Define the CLEAN onMount block (No loading screens, no timers)
const cleanScriptBlock = `  onMount(async () => {
    // Instant load - no splash, no waiting
    grid = await Promise.all(Array.from({length: 25}, (_, i) => getSeededSymbol(i)));
    
    // Initialize Audio
    ['land.wav', 'win.wav', 'spin.wav', 'woosh.wav'].forEach(f => {
      sfxCache[f] = new Audio('/' + f);
    });
    bgMusic = new Audio('/bg_loop.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
    
    document.addEventListener('visibilitychange', handleVisibility);
  });

  onDestroy(() => {`;

// 2. Regex to capture EVERYTHING from the start of onMount down to onDestroy
// This swallows the "}, 2000);" garbage lines that caused the error.
const dirtyRangeRegex = /onMount\(async \(\) => \{[\s\S]*?onDestroy\(\(\) => \{/;

if (dirtyRangeRegex.test(code)) {
    code = code.replace(dirtyRangeRegex, cleanScriptBlock);
    console.log('✅ SYNTAX ERROR FIXED: Removed hanging braces and timers.');
} else {
    console.log('⚠️ Could not find exact block pattern. Attempting backup fix...');
    // Backup: Just find the hanging lines specifically
    code = code.replace(/document\.addEventListener\('visibilitychange', handleVisibility\);\s*\}\);\s*\}, 2000\);\s*\}, 4000\);/, 
        "document.addEventListener('visibilitychange', handleVisibility);\n  });");
}

// 3. Ensure 'splashStage' is set to 'game' so the grid shows immediately
code = code.replace(/let splashStage = ["'].*?["'];/, 'let splashStage = "game";');

// 4. Double-check HTML to ensure no broken splash overlay code remains
code = code.replace(/{#if splashStage === 'company'}[\s\S]*?{\/if}/, "");

fs.writeFileSync(path, code);

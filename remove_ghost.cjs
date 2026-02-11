const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. REMOVE THE GHOST HTML
// We look for the specific "splash-screen" container and delete it entirely.
// This regex matches the div wrapper and the ghost text inside it.
code = code.replace(/<div class=['"]splash-screen['"][\s\S]*?qwertypoi PRESENTS[\s\S]*?<\/div>\s*<\/div>/, "");
code = code.replace(/<div class=['"]splash-screen['"][\s\S]*?OPEN LIBRARY[\s\S]*?<\/div>\s*<\/div>/, "");

// Backup: If the regex misses (due to formatting), we aggressively replace the start of the HTML body
// We ensure only the background and game-container remain.
if (code.includes('qwertypoi PRESENTS')) {
    const parts = code.split("<div class='game-container'>");
    if (parts.length > 1) {
        // Keep the scripts/styles/bg-fixed, discard the ghost in the middle
        const topPart = parts[0].replace(/<div class=['"]splash-screen['"][\s\S]*?<\/div>/g, ""); 
        code = topPart + "\n<div class='game-container'>" + parts[1];
    }
}

// 2. FIX THE BROKEN JS (Line 259)
// Replace the entire onMount block with a clean, instant-load version.
const cleanJS = `  onMount(async () => {
    // Instant load. No splash. No timers.
    grid = await Promise.all(Array.from({length: 25}, (_, i) => getSeededSymbol(i)));
    
    ['land.wav', 'win.wav', 'spin.wav', 'woosh.wav'].forEach(f => {
      sfxCache[f] = new Audio('/' + f);
    });
    bgMusic = new Audio('/bg_loop.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
    document.addEventListener('visibilitychange', handleVisibility);
  });`;

// Replace whatever mess is currently in onMount
code = code.replace(/onMount\(async \(\) => \{[\s\S]*?document\.addEventListener\('visibilitychange', handleVisibility\);\s*\}\s*\)?;(\s*\}\s*, \d+\)\s*;)*(\s*\}\s*, \d+\)\s*;)?/, cleanJS);

// 3. FIX THE BROKEN CSS (Line 433)
// Remove the garbage "*{}</style>" or "}</style>" at the end
code = code.replace(/(\s*\}\s*)+(\*\{\})?\s*<\/style>/, "\n}\n</style>");

// 4. Final Cleanup of Splash variables if they exist
code = code.replace('let showSplash = true;', 'let showSplash = false;');
code = code.replace('let splashStage = "company";', 'let splashStage = "game";');

fs.writeFileSync(path, code);
console.log('✅ GHOST BUSTED: Removed splash HTML, fixed JS syntax, and cleaned CSS.');

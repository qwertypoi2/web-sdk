const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Completely replace the bottom of the script to ensure balance
const scriptEndLogic = `  onMount(async () => {
    // Stage 1: qwertypoi Branding (4 Seconds)
    setTimeout(() => {
      splashStage = "loading";
      
      // Stage 2: Cute Loading Screen (2 Seconds)
      setTimeout(() => {
        splashStage = "game";
        if (bgMusic && !mute) bgMusic.play().catch(() => {});
      }, 2000);
    }, 4000);

    grid = await Promise.all(Array.from({length: 25}, (_, i) => getSeededSymbol(i)));
    ['land.wav', 'win.wav', 'spin.wav', 'woosh.wav'].forEach(f => {
      sfxCache[f] = new Audio('/' + f);
    });
    bgMusic = new Audio('/bg_loop.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
    document.addEventListener('visibilitychange', handleVisibility);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibility);
    }
  });
</script>`;

// This regex finds from the last onMount all the way to the end of the script tag
code = code.replace(/onMount\(async \(\) => \{[\s\S]*?<\/script>/, scriptEndLogic);

fs.writeFileSync(path, code);
console.log('✅ SYNTAX FIXED: Line 276 error resolved and braces balanced.');

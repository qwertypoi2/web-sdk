const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Remove the splashStage logic and set it to game immediately
code = code.replace(/let splashStage = "company";/, 'let splashStage = "game";');

// 2. Remove the timed splash logic from onMount
const cleanOnMount = `  onMount(async () => {
    grid = await Promise.all(Array.from({length: 25}, (_, i) => getSeededSymbol(i)));
    ['land.wav', 'win.wav', 'spin.wav', 'woosh.wav'].forEach(f => {
      sfxCache[f] = new Audio('/' + f);
    });
    bgMusic = new Audio('/bg_loop.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.15;
    document.addEventListener('visibilitychange', handleVisibility);
  });`;

code = code.replace(/onMount\(async \(\) => \{[\s\S]*?\}\);/, cleanOnMount);

// 3. Remove the Splash/Loading HTML blocks
code = code.replace(/{#if splashStage === 'company'}[\s\S]*?{:else if splashStage === 'loading'}[\s\S]*?{\/if}/, "");

// 4. Ensure background.png is the only visible layer
const cleanCSS = `
  .bg-fixed { position:fixed; inset:0; background:url('/background.png') center/cover; z-index:-1; }
  .game-container { background:rgba(255,255,255,0.96); padding:15px; border-radius:20px; width:92vw; max-width:400px; border:4px solid #3d405b; position:relative; }
`;

// Remove the splash-related CSS classes
code = code.replace(/\.splash-screen \{[\s\S]*?@keyframes bounce \{[\s\S]*?\}[\s\S]*?\}/, "");

fs.writeFileSync(path, code);
console.log('✅ CLEAN UP COMPLETE: All loading and company screens removed. Using background.png only.');

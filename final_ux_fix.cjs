const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Force the banner to STAY on until the next spin starts
// Remove any line that sets showWinBanner to false inside processRound
content = content.replace(/showWinBanner = false;/g, '');

// Now, explicitly add it to the TOP of the spin function
content = content.replace(/async function spin\(\) \{/, 
`async function spin() {
    showWinBanner = false; // Only clear now`);

// 2. Fix woosh.wav: Ensure it is preloaded and triggered correctly
// We'll add it to the onMount preloader explicitly
content = content.replace(/onMount\(async \(\) => \{/, 
`onMount(async () => {
    sfxCache['woosh.wav'] = new Audio('/woosh.wav');
    sfxCache['woosh.wav'].load();`);

// Update playSFX to be more aggressive for woosh
content = content.replace(/function playSFX\(file, vol = 0.5\) \{/,
`function playSFX(file, vol = 0.5) {
    if (mute) return;
    const sound = sfxCache[file];
    if (sound) {
      sound.currentTime = 0;
      sound.volume = vol;
      sound.play().catch(e => console.log("Audio error:", e));
    }`);

fs.writeFileSync(filePath, content);
console.log('✅ UX FINALIZED: Banner is now "sticky" and woosh.wav is forced to load.');

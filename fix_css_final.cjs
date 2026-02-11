const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';

if (fs.existsSync(path)) {
  let code = fs.readFileSync(path, 'utf8');

  // 1. Fix the CSS Error: Remove stray '}' and '*{}' before the closing style tag
  // We replace the messy end sequence with a clean closing tag
  code = code.replace(/\}\s*\*{}\s*<\/style>/, "}\n</style>");
  
  // Backup catcher: if it's just '*{' or '}' hanging
  code = code.replace(/\*{}\s*<\/style>/, "</style>");
  code = code.replace(/\}\s*\}\s*<\/style>/, "}\n</style>");

  // 2. Safety Check: Ensure no lingering JS timers from the splash screen removal
  // This removes any hanging "}, 2000);" or "}, 4000);" lines if they still exist
  code = code.replace(/\}\s*\)\s*;\s*\}\s*,\s*2000\s*\)\s*;\s*\}\s*,\s*4000\s*\)\s*;/g, "});");
  code = code.replace(/\}\s*,\s*2000\s*\)\s*;/g, "");

  fs.writeFileSync(path, code);
  console.log('✅ CSS FIXED: Stray characters removed from line 400.');
} else {
  console.log('❌ Error: GameGrid.svelte not found.');
}

const fs = require('fs');
const filePath = 'apps/lofi_library/src/GameGrid.svelte';
let content = fs.readFileSync(filePath, 'utf8');

// Update the banner HTML for better clarity
const newBannerHTML = `
  {#if showWinBanner}
    <div class='banner' in:scale out:fade>
      <div class='total-label'>TOTAL WIN</div>
      <div class='amt'>+{actualSessionWin.toFixed(2)}</div>
      <div class='details'>{bannerText}</div>
      <div class='mult-tag'>Multiplier: {tumbleMultiplier}x</div>
    </div>
  {/if}
`;

// Inject better CSS for the banner
const newBannerCSS = `
  .banner { 
    position:absolute; top:35%; left:50%; transform:translate(-50%, -50%); 
    padding:20px; border-radius:24px; z-index:5000; text-align:center; 
    color:white; background:linear-gradient(135deg, #e07a5f 0%, #be634a 100%); 
    border:6px solid #f2cc8f; box-shadow:0 20px 50px rgba(0,0,0,0.5); 
    min-width:280px; 
  }
  .total-label { font-size: 0.8rem; font-weight: 900; letter-spacing: 2px; opacity: 0.9; }
  .amt { font-size:2.5rem; font-weight:900; text-shadow: 2px 2px 0px rgba(0,0,0,0.2); }
  .mult-tag { margin-top: 10px; background: #3d405b; padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; color: #f2cc8f; border: 1px solid #f2cc8f; }
`;

content = content.replace(/{#if showWinBanner}[\s\S]*?{\/if}/, newBannerHTML);
content = content.replace(/\.banner\s*{[\s\S]*?}/, newBannerCSS);

fs.writeFileSync(filePath, content);
console.log('✅ UI UPDATED: Win banners are now prominent and cumulative.');

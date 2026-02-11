const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// 1. Finalize Multi-Stage Logic and Timing
code = code.replace(
  /onMount\(async \(\) => \{[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?splashStage = "loading";[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?splashStage = "game";/,
  `onMount(async () => {
    // Stage 1: qwertypoi Branding (4 Seconds)
    setTimeout(() => {
      splashStage = "loading";
      
      // Stage 2: Cute Loading Screen (2 Seconds)
      setTimeout(() => {
        splashStage = "game";
        if (bgMusic && !mute) bgMusic.play().catch(() => {});
      }, 2000);
    }, 4000);`
);

// 2. Insert the actual Logo into the HTML
code = code.replace(
  "<div class='banana-line'></div>",
  "<img src='/logo.png' alt='qwertypoi' class='brand-logo-img' />"
);

// 3. Perfect the Sage & Logo CSS
const finalBrandingCSS = `
  .splash-screen { 
    position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; 
    background: url('/background.png') center/cover no-repeat; 
  }
  
  /* Sage Overlay for Branding */
  .company-bg::before { content:''; position:absolute; inset:0; background:#81b29a; opacity:0.96; }
  
  /* Yellow Overlay for Loading */
  .loading-bg::before { content:''; position:absolute; inset:0; background:#f2cc8f; opacity:0.96; }
  
  .logo-box, .cute-loader { position:relative; z-index:11000; text-align:center; }
  
  /* Professional Logo Container */
  .minimal-logo { 
    background:black; width:180px; height:180px; margin:0 auto 20px; border-radius:30px; 
    display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,255,255,0.2);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    overflow: hidden;
  }
  .brand-logo-img { width: 85%; height: 85%; object-fit: contain; }

  .brand-name { color:white; font-size:1.4rem; font-weight:900; letter-spacing:10px; text-transform:uppercase; margin-top: 10px; }

  .cute-loader { color:#3d405b; font-weight:bold; }
  .cat-ear-loader { width:60px; height:40px; border:4px solid #3d405b; border-bottom:none; border-radius:30px 30px 0 0; margin:0 auto 15px; position:relative; animation: bounce 1s infinite; }
`;

// Replace existing splash styles
const styleRegex = /\.splash-screen \{[\s\S]*?@keyframes bounce \{[\s\S]*?\}[\s\S]*?\}/;
code = code.replace(styleRegex, finalBrandingCSS + "\n  @keyframes bounce { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }");

fs.writeFileSync(path, code);
console.log('✅ BRANDING FINALIZED: qwertypoi logo integrated with 4s/2s sequence.');

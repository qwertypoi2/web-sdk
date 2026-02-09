<script>
  import { onMount } from "svelte";
  import { Application, Assets, Sprite, Container, TextureStyle, Text, TextStyle } from "pixi.js";

  let canvasContainer;
  let pixiApp;
  let gridSprites = []; 
  let gridTexts = []; 
  let loadedTextures = {};
  let isSpinning = false;
  let winMessage = "Ready to Spin";

  // SYMBOLS: Headphones are normal. Wild is Wild.
  const symbols = ["matcha", "cat", "book", "succulent", "vinyl", "cabin", "headphones", "candle", "wild"];
  
  // LOGIC SETTING: "wild" is the only wildcard
  const WILD_SYMBOL = "wild";
  const gridSize = 7;

  onMount(async () => {
    // Force pixel-art style (no blur)
    TextureStyle.defaultOptions.scaleMode = 'nearest';
    const screenWidth = Math.min(window.innerWidth - 32, 600);
    
    pixiApp = new Application();
    await pixiApp.init({ 
      width: screenWidth, 
      height: screenWidth, 
      background: "#f0e4d7", 
      backgroundAlpha: 1,
      roundPixels: true, 
      resolution: window.devicePixelRatio || 2,
      autoDensity: true
    });

    canvasContainer.appendChild(pixiApp.canvas);

    for (const name of symbols) {
      try { loadedTextures[name] = await Assets.load(`${name}.png`); } catch (e) {}
    }

    const gridContainer = new Container();
    pixiApp.stage.addChild(gridContainer);
    
    const tileSize = screenWidth / gridSize; 
    
    const wildStyle = new TextStyle({
      fontFamily: "Courier New", 
      fontSize: tileSize * 0.25, 
      fontWeight: "bold",
      fill: "#ffffff", 
      stroke: "#4a3567", 
      strokeThickness: 4,
    });

    for (let i = 0; i < gridSize * gridSize; i++) {
      const sprite = new Sprite(loadedTextures["cat"]); 
      sprite.x = (i % gridSize) * tileSize;
      sprite.y = Math.floor(i / gridSize) * tileSize;
      sprite.width = tileSize; 
      sprite.height = tileSize;
      gridContainer.addChild(sprite);
      gridSprites.push(sprite);

      const text = new Text({ text: "WILD", style: wildStyle });
      text.anchor.set(0.5);
      text.x = sprite.x + tileSize / 2; 
      text.y = sprite.y + tileSize / 2;
      text.visible = false; 
      gridContainer.addChild(text);
      gridTexts.push(text);
    }
    spin(); 
  });

  function spin() {
    if (isSpinning) return;
    isSpinning = true;
    winMessage = "Spinning...";

    let logicGrid = [];
    for (let y = 0; y < gridSize; y++) {
      let row = [];
      for (let x = 0; x < gridSize; x++) {
        row.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      logicGrid.push(row);
    }

    for (let i = 0; i < gridSize * gridSize; i++) {
      const x = i % gridSize;
      const y = Math.floor(i / gridSize);
      const symbol = logicGrid[y][x];
      
      gridSprites[i].texture = loadedTextures[symbol];
      gridSprites[i].alpha = 1; 
      
      // ONLY show text label if it is the REAL wild ticket
      if (symbol === WILD_SYMBOL) {
        gridTexts[i].visible = true;
      } else {
        gridTexts[i].visible = false;
      }
    }

    const wins = findClusters(logicGrid);

    if (wins.length > 0) {
      winMessage = `WIN! Found ${wins.length} clusters!`;
      gridSprites.forEach(s => s.alpha = 0.4);
      gridTexts.forEach(t => t.alpha = 0.4);

      wins.forEach(cluster => {
        cluster.forEach(({x, y}) => {
          const index = y * gridSize + x;
          gridSprites[index].alpha = 1.0;
          if (gridTexts[index].visible) gridTexts[index].alpha = 1.0;
        });
      });
    } else {
      winMessage = "No wins this time.";
    }
    setTimeout(() => { isSpinning = false; }, 200);
  }

  function findClusters(grid) {
    let visited = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    let clusters = [];

    function getCluster(x, y, type) {
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return []; 
      if (visited[y][x]) return []; 
      
      const currentSymbol = grid[y][x];
      const isMatch = (currentSymbol === type) || (currentSymbol === WILD_SYMBOL) || (type === WILD_SYMBOL);
      if (!isMatch) return [];

      visited[y][x] = true;
      let coords = [{x, y}];
      coords = coords.concat(getCluster(x + 1, y, type));
      coords = coords.concat(getCluster(x - 1, y, type));
      coords = coords.concat(getCluster(x, y + 1, type));
      coords = coords.concat(getCluster(x, y - 1, type));
      return coords;
    }

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (!visited[y][x]) {
          const type = grid[y][x];
          // FIX: Don't start searching on a Wild
          if (type === WILD_SYMBOL) continue;
          const cluster = getCluster(x, y, type);
          if (cluster.length >= 5) clusters.push(cluster);
        }
      }
    }
    return clusters;
  }
</script>

<div class="game-wrapper">
  <h3>{winMessage} - v2</h3>
  <div bind:this={canvasContainer}></div>
  <button on:click={spin} disabled={isSpinning}>SPIN</button>
</div>

<style>
  .game-wrapper {
    display: flex; flex-direction: column; align-items: center; s 
    gap: 15px; width: 100%; padding-top: 10px; font-family: monospace;
  }
  h3 { min-height: 1.5em; color: #4a3567; font-weight: bold;}
  button {
    background-color: #6a4c93; color: white;
    font-size: 1.5rem; padding: 15px 40px;
    border: none; border-radius: 12px;
    cursor: pointer; box-shadow: 0 4px 0 #4a3567;
  }
  button:active { transform: translateY(4px); box-shadow: none; }
</style>

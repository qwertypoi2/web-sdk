<script lang="ts">
  import { onMount } from 'svelte';
  import { Application, Assets, Sprite, Container } from 'pixi.js';
  import { play, endRound } from 'stake-engine-client';

  let pixiContainer: HTMLDivElement;
  let app: Application;
  const GRID_SIZE = 7;
  const SYMBOL_SIZE = 60;

  onMount(async () => {
    app = new Application();
    await app.init({ width: GRID_SIZE * SYMBOL_SIZE, height: GRID_SIZE * SYMBOL_SIZE, background: '#f0e4d7' });
    pixiContainer.appendChild(app.canvas);

    const symbols = ['matcha', 'cat', 'book', 'succulent', 'vinyl', 'cabin', 'headphones', 'wild'];
    for (const name of symbols) {
      await Assets.load(`/${name}.png`);
    }

    const gridContainer = new Container();
    app.stage.addChild(gridContainer);
    
    for (let i = 0; i < 49; i++) {
      const texture = Assets.get('matcha');
      const sprite = new Sprite(texture);
      sprite.x = (i % GRID_SIZE) * SYMBOL_SIZE;
      sprite.y = Math.floor(i / GRID_SIZE) * SYMBOL_SIZE;
      sprite.width = sprite.height = SYMBOL_SIZE - 5;
      gridContainer.addChild(sprite);
    }
  });

  async function handleSpin() {
    // Sends a $1 bet (1,000,000 units) to the RGS
    const response = await play({ amount: 1000000, mode: 'BASE' });
    
    if (response.status === 'SUCCESS') {
      console.log("Win Result:", response.round.payoutMultiplier);
      if (response.round.payoutMultiplier > 0) {
        await endRound(); // Finalizes the transaction
      }
    }
  }
</script>

<div class="game-wrapper">
  <div bind:this={pixiContainer}></div>
  <button on:click={handleSpin} class="spin-btn">SPIN</button>
</div>

<style>
.game-wrapper { display: flex; flex-direction: column; align-items: center; gap: 20px; padding-top: 20px; }
.spin-btn { 
    width: 200px; height: 60px; background: #8e7f7d; color: white; 
    border: none; border-radius: 30px; font-weight: bold; font-size: 1.2rem;
  }
</style>

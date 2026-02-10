<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let progress = 0;
  const dispatch = createEventDispatcher();

  onMount(() => {
    if (progress === 0) {
      let interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => dispatch('loaded'), 500);
        }
      }, 100);
    }
  });
</script>

<div class="loading-container" out:fade={{ duration: 800 }}>
  <img src="/loading_bg.png" alt="Lofi Library Desk" class="bg-image" />

  <h1 class="game-title">LOFI LIBRARY</h1>

  <div class="progress-area">
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" style="width: {progress}%"></div>
    </div>
    <div class="loading-text">LOADING... {Math.floor(progress)}%</div>
  </div>
  
  <div class="version">v1.0.0 | High Volatility</div>
</div>

<style>
  :global(body) { margin: 0; padding: 0; overflow: hidden; background: #000; }
  
  .loading-container {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    font-family: 'Special Elite', monospace;
    color: #F4F1DE;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }

  .game-title {
    margin-top: 8vh;
    font-size: 3.5rem;
    text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.6);
    letter-spacing: 2px;
    z-index: 2;
  }

  .progress-area {
    margin-bottom: 12vh;
    width: 60%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    z-index: 2;
  }

  .progress-bar-bg {
    width: 100%;
    height: 12px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #52796f;
  }

  .progress-bar-fill {
    height: 100%;
    background: #F2CC8F;
    box-shadow: 0 0 10px #F2CC8F;
    transition: width 0.1s linear;
  }

  .loading-text {
    font-size: 1.2rem;
    color: #F2CC8F;
    text-shadow: 1px 1px 2px black;
  }

  .version {
    position: absolute;
    bottom: 10px;
    right: 15px;
    font-size: 0.7rem;
    opacity: 0.6;
  }
</style>

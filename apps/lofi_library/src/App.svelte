<script>
  import GameGrid from './GameGrid.svelte';
  import LoadingScreen from './LoadingScreen.svelte';

  let isLoading = true;

  function handleLoaded() {
    isLoading = false;
  }
</script>

<main>
  {#if isLoading}
    <LoadingScreen on:loaded={handleLoaded} />
  {/if}
  
  <div class="game-wrapper" class:hidden={isLoading}>
    <GameGrid />
  </div>
</main>

<style>
  :global(body) { margin: 0; padding: 0; overflow: hidden; background: #000; }
  main { width: 100vw; height: 100vh; position: relative; }

  .hidden {
    opacity: 0;
    pointer-events: none;
    z-index: -1;
  }
  
  .game-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 1s ease-in;
    opacity: 1;
  }
</style>

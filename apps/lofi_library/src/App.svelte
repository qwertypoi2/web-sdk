<script>
  import GameGrid from "./GameGrid.svelte";
</script>

<main>
  <div class="game">
    <GameGrid />
  </div>
</main>

<style>
  :global(body) { margin: 0; padding: 0; }
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: transparent;
  }
  .game {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 40px;
  }
</style>

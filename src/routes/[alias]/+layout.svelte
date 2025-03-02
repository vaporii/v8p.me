<script lang="ts">
  import "@fontsource/jetbrains-mono";
  import "../..app.scss";

  let { children } = $props();
</script>

<div class="app">
  <main>
    {@render children()}
  </main>
</div>

<style>
</style>

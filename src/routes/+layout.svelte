<script lang="ts">
  import "@fontsource/jetbrains-mono";
  import "../app.scss";

  let { children } = $props();
</script>

<div class="app">
  <main>
    {@render children()}
  </main>
  <footer>
    <div class="footer-text">
      by uploading a file, you agree to the <a href="/terms">terms of use</a>
    </div>
    <div class="footer-text bottom">
      <a href="https://github.com/vaporii/v8p.me">view source on github</a>
    </div>
  </footer>
</div>

<style lang="scss">
  @use "/src/vars" as *;

  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  main {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: scroll;
  }

  footer {
    width: 100%;
    min-height: max-content;
    background-color: $bg;
    z-index: 5;
  }

  .footer-text {
    margin-bottom: $smaller-padding;
    width: 100%;
    text-align: center;
  }
  
  .bottom {
    margin-bottom: $padding;
  }

  @media screen and (max-height: 770px) {
    .bottom {
      display: none;
    }
  }
</style>

<script lang="ts">
  import { page } from '$app/state';
  import Module from '../components/Module.svelte';
  const path = page.url.pathname;
</script>

<div class="wrapper">
  <div class="left">
    <h1>404</h1>
    <h2>page not found</h2>
    <div class="terminal">
      <div>[guest@v8p /]$ cd ~{path}</div>
      <div>bash: cd: /home/v8p{path}: <span class="strong">No such file or directory</span></div>
      <div>[guest@v8p /]$ cd ~</div>
      <div><a class="strong" href="/">→ return home</a></div>
      <div>[guest@v8p ~]$ <span class="cursor">&nbsp;</span></div>
    </div>
  </div>
  <div class="right">
    <pre>
  ╱|、
(˚ˎ 。7
 |、˜〵
 じしˍ,)ノ
    </pre>
  </div>
</div>

<style lang="scss">
  @use '../vars' as *;

  .wrapper {
    padding-bottom: $padding;
    color: $fg-3;
    position: absolute;
    top: 50%;
    left: 10vw;
    right: 10vw;
    transform: translate(0%, -50%);
    font-size: 20px;

    display: flex;
  }

  .right {
    margin-left: auto;
  }

  pre {
    font-weight: 1000;
    font-size: 40px;
    line-height: 1.4em;
  }

  @media screen and (max-width: 1000px) {
    .right {
      display: none;
    }
  }

  h1 {
    font-size: 70px;
    color: $fg;
  }

  h2 {
    font-size: 60px;
    color: $fg-3;
    margin: 0;
    margin-bottom: 50px;
  }

  .strong {
    color: $fg;
    font-weight: bold;
  }

  a {
    color: $accent !important;
  }

  .cursor {
    animation: blink 1s infinite;
    animation-timing-function: steps(2, jump-none);
    background-color: $fg-3;
  }

  @keyframes blink {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }
</style>

<script lang="ts">
	import { page } from "$app/state";
  import Module from "../components/Module.svelte";
  const path = page.url.pathname;
</script>

<div class="center">
  <div>[guest@server /]$ cd ~{path}</div>
  <div>bash: cd: /home/server{path}: <span class="strong">No such file or directory</span></div>
  <div>[guest@server /]$ help</div>
  <div><span class="strong">alias not found. maybe turn it off and back on?</span></div>
  <div>[guest@server /]$ <span class="cursor">&nbsp;</span></div>
  <div class="spacer"></div>
</div>

<style lang="scss">
  @use "../vars" as *;
  
  .center {
    padding-bottom: $padding;
    color: $fg-3;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-height: 300px;
    min-width: 300px;
    max-width: 800px;
    width: 60vw;
  }

  .strong {
    color: $fg;
    font-weight: bold;
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

  .spacer {
    height: 200px;
  }
</style>

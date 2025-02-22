<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    text,
    children
  }: {
    text: string;
    children: Snippet<[]>;
  } = $props();
</script>

<div class="module-bg">
  <div class="module-in">
    {@render children()}
  </div>
  <div class="module-text">{text}</div>
</div>

<style lang="scss">
  @use "../vars" as *;

  .module-bg {
    background-color: $bg-0;
    box-sizing: border-box;
    padding: $padding;
    padding-bottom: 0;
    position: relative;
  }

  .module-in {
    border: $module-border solid $bg-2;
    box-sizing: border-box;
    padding: $padding;
  }

  .module-text {
    position: absolute;
    color: $bg-3;
    background-color: $bg-0;
    padding: 0 $module-text-pad;
    top: $module-text-top;
    left: $module-text-left;
    font-weight: bold;
  }
</style>

<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    text,
    children,
    collapsable
  }: {
    text: string;
    children: Snippet<[]>;
    collapsable?: boolean;
  } = $props();
</script>

<div class="module-bg">
  <div class="module-in">
    {@render children()}
  </div>
  <div class="module-text">{text}</div>
  {#if collapsable}
    <button class="dropdown"><img src="/icons/dropdown.svg" alt="show/hide options icon"></button>
  {/if}
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

  .dropdown {
    width: min-content;
    height: 24px;
    padding: 0;
    margin: 0;
    background-color: $bg-0;
    margin-top: -1px;

    position: absolute;
    top: $module-text-top;
    right: $module-text-left;
  }

  .dropdown img {
    width: 30px;
  }
</style>

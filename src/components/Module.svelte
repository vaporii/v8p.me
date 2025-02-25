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

  let collapsed = $state(false);

  function toggleCollapsed() {
    collapsed = !collapsed;
  }
</script>

<div class={"module-bg"}>
  {#if collapsable}
    <button class="dropdown" onclick={toggleCollapsed}
      ><img
        src="/icons/dropdown.svg"
        alt="show/hide options icon"
        class={collapsed ? "flipped" : ""}
      /></button
    >
  {/if}
  <div class={"module-in"}>
    <div class={"in-in" + (collapsed ? " collapsed" : "")}>
      {@render children()}
    </div>
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

    // overflow: hidden;
  }

  .module-in {
    border: $module-border solid $bg-2;
    box-sizing: border-box;
    // padding: $padding;
    overflow: hidden;
  }

  .in-in {
    margin: $padding;
    // margin-top: $padding;
    transition: margin-top $transition-duration;
  }

  .dropdown img {
    width: 30px;
    transition: transform $transition-duration;
  }
  
  .flipped {
    transform: rotate(180deg);
  }
  
  .collapsed {
    margin-top: -145px;
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

    outline: none;
  }

</style>

<script lang="ts">
  let icon: HTMLImageElement;
  let left = $state(0);
  let top = $state(0);

  let { text }: { text: string } = $props();

  $effect(() => {
    left = icon.offsetLeft - 183;
    top = icon.offsetTop - 145;
  });
</script>

<img src="/icons/help.svg" alt="help icon" bind:this={icon}>

<div class="popup" style={`left: ${left}px; top: ${top}px;`}>
  <div class="arrow"></div>
  <div class="cover"></div>
  <span class="text">{text}</span>
</div>

<style lang="scss">
	@use '/src/vars' as *;

  img {
    margin-left: $smaller-padding;
  }

  img:hover {
    background-color: $bg-3;
  }

  .popup {
    visibility: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 385px;
    height: 100px;
    background-color: $bg-0;
    border: $module-border solid $fg-1;
    z-index: 3;
    opacity: 0%;
    translate: 0 20px;
    transition: all $transition-duration;
  }

  img:hover ~ div {
    visibility: visible;
    display: block;
    opacity: 100%;
    translate: 0 0px;
  }

  .arrow {
    width: 40px;
    height: 40px;
    position: absolute;
    left: 50%;
    bottom: 0;
    background-color: $bg-0;
    transform: translate(-50%, 50%) rotate(45deg);
    border: $module-border solid $fg-1;
  }

  .cover {
    width: 100%;
    height: 35px;
    position: absolute;
    bottom: 0;
    background-color: $bg-0;
  }

  .text {
    position: absolute;
    top: 17px;
    left: 20px;
    width: 346px;
    height: 63px;
    font-size: 16px;
    color: $fg-1;
  }
</style>
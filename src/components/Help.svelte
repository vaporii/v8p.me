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

<img src="/icons/help.svg" alt="help icon" bind:this={icon} />

<div class="popup" style={`left: ${left}px; top: ${top}px;`}>
  <div class="arrow"></div>
  <div class="cover">
    <span class="text">{text}</span>
  </div>
</div>

<style lang="scss">
  @use "/src/vars" as *;

  img {
    margin-left: $smaller-padding;
  }

  img:hover {
    background-color: $bg-3;
  }

  .popup {
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
    scale: 0%;
    transition: scale 0ms $transition-duration, opacity $transition-duration 0ms, translate $transition-duration;
  }

  img:hover ~ .popup {
    display: block;
    opacity: 100%;
    translate: 0 0px;
    scale: 100%;
    transition: scale 0ms 0ms, opacity $transition-duration 0ms, translate $transition-duration;
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
    height: 100%;
    position: absolute;
    top: 0;
    background-color: $bg-0;
    text-align: center;
    padding: 15px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .text {
    font-size: 16px;
    color: $fg-1;
  }
</style>

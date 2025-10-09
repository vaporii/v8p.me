<script lang="ts">
  let {
    isActive = $bindable(false),
    label
  }: {
    isActive?: boolean;
    label: string;
  } = $props();
</script>

<label class="switch" aria-label={label}>
  <input type="checkbox" bind:checked={isActive} aria-label={label} />
  <div class={(isActive ? "switch-active" : "") + " switch-circle"}></div>
</label>

<style lang="scss">
  @use "../vars" as *;

  .switch {
    position: relative;
    display: inline-block;

    width: 62px;
    height: 33px;
    box-sizing: border-box;
    margin-left: auto;

    border: $module-border solid $fg-1;
    background-color: $bg-0-soft;
    cursor: pointer;

    input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
  }

  .switch:has(input:focus) {
    outline: $focus-outline;
  }

  .switch-circle {
    width: 25px;
    height: 25px;
    background-color: $fg-1;
    margin: 2px;
    transition: all 200ms cubic-bezier(1, 0, 0, 1);
  }

  .switch-active {
    margin-left: 32px;
    background-color: $fg;
  }
</style>

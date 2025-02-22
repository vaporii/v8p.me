<script lang="ts">
  let {
    isActive = $bindable(false),
    label,
    onClick
  }: {
    isActive?: boolean;
    label: string;
    onClick?: (e: MouseEvent) => void;
  } = $props();
  const click = onClick || (() => {});

  function toggleActive(e: MouseEvent) {
    isActive = !isActive;
    click(e);
  }
</script>

<button class="switch" onclick={toggleActive} aria-label={label}>
  <div class={(isActive ? 'switch-active' : '') + ' switch-circle'}></div>
</button>

<style lang="scss">
  @use '../vars' as *;

  .switch {
    all: none;
    display: inline-block;

    width: 68px;
    height: 33px;
    background-color: $bg-0-soft;
    padding: 0;
    border: $module-border solid $fg-1;

    cursor: pointer;
  }

  .switch-circle {
    width: 25px;
    height: 25px;

    background-color: $fg-1;
    margin: 2px;

    transition: all 200ms cubic-bezier(1, 0, 0, 1);
  }

  .switch-active {
    margin-left: 37px;
    background-color: $fg;
  }
</style>

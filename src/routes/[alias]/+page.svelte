<script lang="ts">
	import Module from '../../components/Module.svelte';

  let { data } = $props();
</script>

<Module text="file">
  <div class="filename"></div>
</Module>

<style lang="scss">
</style>

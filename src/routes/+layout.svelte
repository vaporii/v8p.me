<script lang="ts">
	import "@fontsource-variable/jetbrains-mono";
	import '../app.scss';

	let { children } = $props();
</script>

<div class="app">
	<main>
		{@render children()}
	</main>
</div>

<style>
</style>

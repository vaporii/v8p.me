<script lang="ts">
	import { roundToDecimal } from '$lib';
	import Module from '../../../components/Module.svelte';
	let size = $state(0);
	let progress = $state('generate file');

	async function generateFile() {
		const root = await navigator.storage.getDirectory();
		const draftHandle = await root.getFileHandle('file_v8p.me', { create: true });
		const writable = await draftHandle.createWritable();

		let complete = 0;
		const chunkSize = 64 * 1024; // 64 KiB
		const stream = new ReadableStream({
			async pull(controller) {
				controller.enqueue(
					crypto.getRandomValues(new Uint8Array(Math.min(chunkSize, size - complete)))
				);
				complete += chunkSize;

				progress = `generating... ${roundToDecimal((Math.min(size, complete) / size) * 100, 2)}%`;

				if (complete >= size) controller.close();
			}
		});

		await stream.pipeTo(writable);
		progress = `done!`;

		const file = await draftHandle.getFile();
		const url = URL.createObjectURL(file);
		const a = document.createElement('a');
		a.href = url;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}
</script>

<div class="center">
	<Module text="file generator">
		<input type="number" bind:value={size} placeholder="bytes" />
		<button onclick={generateFile} class="upload">{progress}</button>
	</Module>
</div>

<style lang="scss">
	@use '/src/vars' as *;

	button {
		margin-top: $padding;
		padding: 0 $small-padding;
	}
</style>

<script lang="ts">
	import { roundToDecimal, tryRemoveFileEntry } from '$lib';
	import Module from '../../../components/Module.svelte';
	let fileSize = $state(0);
	let unit = $state(1);
	let progress = $state('generate file');

	async function generateFile() {
		const size = fileSize * unit;
		const root = await navigator.storage.getDirectory();
		await tryRemoveFileEntry(root, 'file_v8p.me');

		const draftHandle = await root.getFileHandle('file_v8p.me', { create: true });
		const writable = await draftHandle.createWritable();

		let complete = 0;
		const chunkSize = 64 * 1024; // 64 KiB (max crypto.getRandomValues size)
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
		a.download = 'file.bin';
		document.body.appendChild(a);
		a.click();
		a.remove();
	}
</script>

<div class="center">
	<Module text="file generator">
		<div class="wrapper">
			<input type="number" bind:value={fileSize} />
			<select name="sizes" id="sizes" bind:value={unit}>
				<option value="1">bytes</option>
				<option value="1000">kilobytes</option>
				<option value="1000000">megabytes</option>
				<option value="1000000000">gigabytes</option>
			</select>
		</div>
		<button onclick={generateFile} class="upload">{progress}</button>
	</Module>
</div>

<style lang="scss">
	@use '/src/vars' as *;

	.wrapper {
		display: flex;
		gap: $padding;
	}

	select {
		height: 33px;
	}

	button {
		margin-top: $padding;
		padding: 0 $small-padding;
	}
</style>

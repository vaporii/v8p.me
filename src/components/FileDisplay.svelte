<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	import * as langs from 'svelte-highlight/languages';
	import { type LanguageType } from 'svelte-highlight/languages';

	import Text from './file_displays/Text.svelte';
	import type { FileInfo } from '$lib/types';
	import { fileTypes } from '$lib';

	let { fileInfo, url, children }: { fileInfo: FileInfo; url: string; children: Snippet } =
		$props();

	let text = $state('loading...');

	const type = fileInfo.fileType.split('/')[0];

	const split = fileInfo.fileName.split('.');
	const ext = split[split.length - 1];

	const language = fileTypes.find((type) => {
		return type.ext === ext;
	});

	async function getText() {
		const req = await fetch(url);
		text = await req.text();
	}

	onMount(() => {
		// only display under 500KB
		if (fileInfo.fileSize < 1000 * 500) {
			getText();
		} else {
			text = 'text is too large to display';
		}
	});
</script>

{#if type === 'audio'}
	<audio controls>
		<source src={url} type={fileInfo.fileType} />
		your browser doesn't support this audio type :(
	</audio>
{:else if type === 'video'}
	<video controls>
		<source src={url} type={fileInfo.fileType} />
		<track kind="captions" />
		your browser doesn't support this video type :(
	</video>
{:else if type === 'image'}
	<img src={url} alt={fileInfo.fileName}>
{:else if language || type === 'text'}
	<Text {text} language={language?.lang || langs.plaintext}></Text>
{/if}

{@render children()}

<style lang="scss">
	audio,
	video {
		width: 100%;
	}
</style>

<script lang="ts">
	import { Highlight, LineNumbers } from 'svelte-highlight';
	import type { LanguageType } from 'svelte-highlight/languages';
	import { gruvboxDarkMedium } from 'svelte-highlight/styles';

	let iconUrl = $state('/icons/copy.svg');

	let { text, language }: { text: string; language: LanguageType<string> } = $props();
  let timeout: any;

	async function copyToClipboard() {
    if (timeout) clearTimeout(timeout);
		try {
			await navigator.clipboard.writeText(text);
			iconUrl = '/icons/check.svg';
		} catch (e) {
			console.error(e);
			iconUrl = '/icons/error.svg';
		}

		timeout = setTimeout(() => {
			iconUrl = '/icons/copy.svg';
		}, 2000);
	}
</script>

<svelte:head>
	{@html gruvboxDarkMedium}
</svelte:head>

<div class="outer-wrapper">
	<button class="copy" title="copy to clipboard" onclick={copyToClipboard}>
		<img src={iconUrl} alt="copy to clipboard" />
	</button>
	<div class="wrapper">
		<div class="inner-wrapper">
			<Highlight {language} code={text} let:highlighted langtag>
				<LineNumbers {highlighted} --padding-left="5px" --padding-right="10px" hideBorder />
			</Highlight>
		</div>
	</div>
</div>

<style lang="scss">
	@use '/src/vars' as *;

	.outer-wrapper {
		position: relative;
	}

	.wrapper {
		max-height: 50vh;
		overflow: scroll;
	}

	.copy {
		position: absolute;
		width: 50px;
		height: 50px;
		z-index: 3;
		top: $padding;
		right: $padding;

    background-color: $bg-2;
    opacity: 60%;

    transition: $transition-duration;
	}

  .copy:hover {
    opacity: 100%;
  }

	.copy img {
    width: 30px;
    margin-top: $smaller-padding;
	}

	.inner-wrapper {
		width: max-content;
	}
</style>

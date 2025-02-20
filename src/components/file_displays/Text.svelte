<script lang="ts">
	import { Highlight, LineNumbers } from 'svelte-highlight';
	import type { LanguageType } from 'svelte-highlight/languages';
	import { gruvboxDarkMedium } from 'svelte-highlight/styles';

	let { text, language }: { text: string; language: LanguageType<string> } = $props();
</script>

<svelte:head>
	{@html gruvboxDarkMedium}
</svelte:head>

<div class="wrapper">
	<div class="inner-wrapper">
		<Highlight {language} code={text} let:highlighted>
			<LineNumbers
        {highlighted}
        --padding-left="5px"
        --padding-right="10px"
      />
		</Highlight>
	</div>
</div>

<style lang="scss">
	.wrapper {
		max-height: 50vh;
		overflow: scroll;
	}

	.inner-wrapper {
		width: max-content;
	}
</style>

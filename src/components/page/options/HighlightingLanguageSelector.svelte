<script lang="ts">
  import { fileTypes } from "$lib";
  import Help from "../../Help.svelte";

  let {
    highlightingLanguage = $bindable("txt"),
    disabled
  }: {
    highlightingLanguage: string;
    disabled?: boolean;
  } = $props();
</script>

<label for="language" class="option-label"
  >language<Help
    text="set the language to control how written text is displayed in the file preview page."
  /></label
>
<select name="langs" id="langs" bind:value={highlightingLanguage} {disabled}>
  {#each fileTypes as fileType}
    <option value={fileType.ext}>{fileType.langName} (.{fileType.ext})</option>
  {/each}
  <option value="binary">file</option>
</select>

<style lang="scss">
  .option-label {
    display: flex;
    margin: auto 0;
  }

  select {
    min-width: 0;
  }
</style>

<script lang="ts">
  import Module from "../../Module.svelte";
  import FileSelector from "./FileSelector.svelte";

  let {
    file = $bindable(undefined)
  }: {
    file?: File | undefined;
  } = $props();

  $effect(() => {
    file = files?.item(0) || undefined;
    console.log(file);
  });

  let files: FileList | null | undefined = $state(undefined);
</script>

<FileSelector {files} />

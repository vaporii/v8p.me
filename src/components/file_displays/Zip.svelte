<script lang="ts">
  import { goto } from "$app/navigation";
  import { formatSize, roundToDecimal } from "$lib";
  import { getStorageFileHandle } from "$lib/uploader";
  import {
    ZipReader,
    HttpReader,
    BlobReader,
    HttpRangeReader,
    type FileEntry
  } from "@zip.js/zip.js";

  let { url }: { url: string } = $props();

  const loadingStates = $state<Record<string, boolean>>({});
  const dotCounts = $state<Record<string, number>>({});

  async function getZipResults(url: string) {
    if (url.startsWith("blob:")) {
      const req = await fetch(url);
      return new ZipReader(new BlobReader(await req.blob())).getEntries();
    } else {
      return new ZipReader(new HttpRangeReader(url, {})).getEntries();
    }
  }

  function getFilename(path: string): string {
    return path.split(/[/\\]/).pop() || "";
  }

  let entryNum = 0;
  async function downloadEntry(entry: FileEntry) {
    loadingStates[entry.filename] = true;
    dotCounts[entry.filename] = 0;

    let downloaded = 0;
    const handle = await getStorageFileHandle((++entryNum).toString(), {});
    const writable = await handle.createWritable();

    await entry.getData(writable, {
      async onprogress(progress, total) {
        downloaded = (progress / total) * 100;
        dotCounts[entry.filename] = downloaded;
      }
    });

    const file = await handle.getFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = getFilename(entry.filename);
    document.body.appendChild(a);
    a.click();
    a.remove();

    loadingStates[entry.filename] = false;
  }
</script>

<div class="wrapper">
  {#await getZipResults(url)}
    loading...
  {:then results}
    <div id="file-table">
      {#each results as result}
        <button
          class="table-filename"
          disabled={loadingStates[result.filename]}
          onclick={async () => {
            if (result.directory || loadingStates[result.filename]) return;
            await downloadEntry(result);
          }}
        >
          {#if loadingStates[result.filename]}
            loading {roundToDecimal(dotCounts[result.filename] ?? 0, 2)}%
          {:else}
            {result.filename}
          {/if}
        </button>
        <div class="table-filesize">{formatSize(result.uncompressedSize)}</div>
      {/each}
    </div>
  {/await}
</div>

<style lang="scss">
  @use "/src/vars" as *;

  #file-table {
    display: grid;
    grid-template-columns: 1fr auto;
    width: 100%;
  }

  .table-filename {
    all: unset;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: $accent;
    text-decoration: underline;
    cursor: pointer;
  }

  .table-filename[disabled] {
    opacity: 0.6;
    cursor: wait;
  }

  .table-filename:hover:not([disabled]) {
    color: $accent-hover;
  }

  .table-filesize {
    white-space: nowrap;
    text-align: right;

    color: $fg-1;
  }
</style>

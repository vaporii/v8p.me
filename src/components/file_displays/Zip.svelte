<script lang="ts">
  import { formatSize } from "$lib";
  import { ZipReader, HttpReader, BlobReader, HttpRangeReader } from "@zip.js/zip.js";

  let { url }: { url: string } = $props();

  async function getZipResults(url: string) {
    if (url.startsWith("blob:")) {
      const req = await fetch(url);
      return new ZipReader(new BlobReader(await req.blob())).getEntries();
    } else {
      return new ZipReader(new HttpRangeReader(url, {})).getEntries();
    }
  }
</script>

<div class="wrapper">
  {#await getZipResults(url)}
    loading...
  {:then results}
    <div id="file-table">
      {#each results as result}
        <div class="table-filename">{result.filename}</div>
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: $accent;
    text-decoration: underline;
    cursor: pointer;
  }

  .table-filename:hover {
    color: $accent-hover;
  }

  .table-filesize {
    white-space: nowrap;
    text-align: right;

    color: $fg-1;
  }
</style>

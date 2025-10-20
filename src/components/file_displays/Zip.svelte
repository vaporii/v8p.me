<script lang="ts">
  import { ZipReader, HttpReader, BlobReader, HttpRangeReader } from "@zip.js/zip.js";

  let { url }: { url: string } = $props();

  async function getZipResults(url: string) {
    if (url.startsWith("blob:")) {
      const req = await fetch(url)
      return new ZipReader(new BlobReader(await req.blob())).getEntries();
    } else {
      return new ZipReader(new HttpRangeReader(url, {})).getEntries();
    }
  }

  // console.log(getZipResults(blob));
</script>

{#await getZipResults(url)}
  loading...
{:then results}
  {#each results as result}
    <div>{result.filename}</div>
  {/each}
{/await}

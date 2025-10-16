<script lang="ts">
  import { onMount, type Snippet } from "svelte";

  import * as langs from "svelte-highlight/languages";
  import { type LanguageType } from "svelte-highlight/languages";

  import Text from "./file_displays/Text.svelte";
  import type { FileInfo } from "$lib/types";
  import { fileTypes } from "$lib";

  let { fileInfo, url, children }: { fileInfo: FileInfo; url: string; children: Snippet } =
    $props();

  let text = $state("loading...");

  const type = fileInfo.fileType.split("/")[0];

  const parts = fileInfo.fileName.split(".");
  const ext = parts.length > 1 ? parts.pop() : parts[0];

  const language = fileTypes.find((type) => {
    return type.ext === ext?.toLowerCase();
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
      text = "text is too large to display";
    }
  });
</script>

{#if language || type === "text"}
  <Text {text} language={language?.lang || langs.plaintext}></Text>
  {@render children()}
{:else if type === "video"}
  <div class="wrapper">
    <video controls>
      <source src={url} />
      <track kind="captions" />
      your browser doesn't support this video type :(
    </video>
  </div>
  {@render children()}
{:else if type === "image"}
  <div class="wrapper">
    <img src={url} alt={fileInfo.fileName} class="image-display" />
  </div>
  {@render children()}
{:else if type === "audio"}
  <div class="wrapper">
    <audio controls>
      <source src={url} type={fileInfo.fileType} />
      your browser doesn't support this audio type :(
    </audio>
  </div>
  {@render children()}
{/if}

<style lang="scss">
  audio,
  video,
  img {
    max-width: 100%;
    max-height: 50vh;
  }

  audio {
    width: 100%;
  }

  .wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>

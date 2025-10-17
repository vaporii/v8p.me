<script lang="ts">
  import { formatSize } from "$lib";
  import { getFilesFromDataTransfer } from "$lib/files";

  let {
    files = $bindable()
  }: {
    files: FileList | null | undefined;
  } = $props();

  let draggingOver = $state(false);

  let fileDetails = $derived.by(() => {
    console.log(files);
    let info = {
      titles: ["drop files here"],
      subtitle: "or, click to choose",
      iconPath: "/icons/upload.svg"
    };

    if (!files?.length) return info;

    if (files.length === 1) {
      const file = files[0];
      info.titles = [file.name];
      info.subtitle = formatSize(file.size);
      info.iconPath = "/icons/file.svg";
    } else {
      let totalSize = 0;
      info.titles = [];
      for (const file of files) {
        totalSize += file.size;
        info.titles.push(file.name);
      }

      info.subtitle = `${files.length} files totalling ${formatSize(totalSize)}`;
    }

    return info;
  });

  let enterTarget: EventTarget | null;
  async function dropHandler(e: DragEvent) {
    e.preventDefault();
    draggingOver = false;
    if (e.dataTransfer === null || e.dataTransfer.files.length === 0) return;
    files = await getFilesFromDataTransfer(e.dataTransfer);
  }

  function startDragging(e: DragEvent) {
    enterTarget = e.target;
    e.stopPropagation();
    e.preventDefault();
    draggingOver = true;
  }

  function stopDragging(e: DragEvent) {
    if (enterTarget !== e.target) return;
    e.stopPropagation();
    e.preventDefault();
    draggingOver = false;
  }
</script>

<div>
  <input type="file" name="file-upload" id="file-upload" bind:files multiple />
  <label
    for="file-upload"
    ondrop={dropHandler}
    ondragover={(e) => {
      e.preventDefault();
    }}
    class={draggingOver ? "drag-over" : ""}
    ondragenter={startDragging}
    ondragleave={stopDragging}
    ondragend={() => {
      draggingOver = false;
    }}
    onmouseleave={() => {
      draggingOver = false;
    }}
    id="file-upload-container"
  >
    {#if fileDetails.titles.length === 1}
      <img class="icon" src={fileDetails.iconPath} alt="upload file icon" />
    {/if}
    <div class={"headers" + (fileDetails.titles.length > 1 ? " file-list" : "")}>
      {#each fileDetails.titles as title}
        <div class="header">{title}</div>
      {/each}
    </div>
    <span class="subtitle">{fileDetails.subtitle}</span>
  </label>
</div>

<svelte:window
  onpaste={(e) => {
    const transfer = new DataTransfer();

    const file = e.clipboardData?.files.item(0);
    if (file) {
      transfer.items.add(file);
      files = transfer.files;
    }
  }}
/>

<style lang="scss">
  @use "../../../vars" as *;

  #file-upload {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  #file-upload:focus-visible ~ #file-upload-container {
    outline: $focus-outline;
  }

  .drag-over {
    outline: $module-border dashed $accent;
  }

  .header {
    max-width: 100%;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .headers {
    font-size: $header-size;
    text-align: center;
    max-width: 100%;

    overflow-x: hidden;
    overflow-y: auto;
  }

  .file-list {
    font-size: $small-font-size;
    text-align: left;

    margin-bottom: $smaller-padding;
  }

  .subtitle {
    font-size: $small-font-size;
    color: $bg-4;
  }

  .icon {
    width: $icon-width;
    height: auto;
  }

  #file-upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    padding: $padding;
    background-color: $bg-0-soft;
    cursor: pointer;
    height: 160px;
  }
</style>

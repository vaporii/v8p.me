<script lang="ts">
  import { formatSize } from "$lib";

  let {
    files = $bindable()
  }: {
    files: FileList | null | undefined;
  } = $props();

  let draggingOver = $state(false);

  let fileDetails = $derived.by(() => {
    let info = {
      title: "drop file here",
      subtitle: "or, click to choose",
      iconPath: "/icons/upload.svg"
    };

    const file = files?.item(0);
    if (file) {
      info.title = file.name;
      info.subtitle = formatSize(file.size);
      info.iconPath = "/icons/file.svg";
    }

    return info;
  });

  let enterTarget: EventTarget | null;
  function dropHandler(e: DragEvent) {
    e.preventDefault();
    draggingOver = false;

    if (e.dataTransfer === null || e.dataTransfer.files.length === 0) return;
    if (e.dataTransfer.items[0].kind !== "file") return;
    files = e.dataTransfer.files;
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
    <img class="icon" src={fileDetails.iconPath} alt="upload file icon" />
    <span class="header">{fileDetails.title}</span>
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
    font-size: $header-size;
    max-width: 100%;

    text-align: center;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
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
  }

  @media screen and (min-height: 750px) {
    #file-upload-container {
      height: 160px;
    }
  }
</style>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { fileTypes, roundToDecimal } from "$lib";
  import Module from "../components/Module.svelte";
  import Help from "../components/Help.svelte";
  import Popup from "../components/Popup.svelte";
  import WriteText from "../components/page/upload/WriteText.svelte";
  import FileSelector from "../components/page/upload/FileSelector.svelte";
  import { getStorageFileHandle, upload } from "$lib/uploader";
  import ExpiryDateSelector from "../components/page/options/ExpiryDateSelector.svelte";
  import HighlightingLanguageSelector from "../components/page/options/HighlightingLanguageSelector.svelte";
  import Switch from "../components/Switch.svelte";
  import { ZipWriterStream } from "@zip.js/zip.js";

  let abortController = new AbortController();

  let uploadButtonDisabled = $state(false);

  let expiresIn = $state(0);
  let highlightingLanguage = $state("txt");
  $effect(() => {
    if (!!files?.item(0)) {
      highlightingLanguage = "binary";
    } else {
      highlightingLanguage = "txt";
    }
  });

  let encryptionEnabled = $state(false);
  let buttonText = $state("upload file or text");
  let text = $state("");
  let password = $state("");
  let progressPercentage = $state(0.0);

  let uploading = $state(false);

  let popupText = $state("");
  let displayingPopup = $state(false);

  let files: FileList | undefined | null = $state();

  function cancelUpload() {
    abortController.abort(new Error("cancelled"));
    files = new DataTransfer().files;
    text = "";
    buttonText = "upload file or text";
    progressPercentage = 0;
    uploading = false;
  }

  async function zipFiles(files: FileList, onProgress?: (progress: number) => void) {
    const handle = await getStorageFileHandle("files.zip", abortController);
    abortController.signal.throwIfAborted();

    const writable = await handle.createWritable();

    const zipper = new ZipWriterStream();
    const pipe = zipper.readable.pipeTo(writable);

    let totalBytes = 0;
    for (const file of files) totalBytes += file.size;

    let processedBytes = 0;

    for (const file of files) {
      const reader = file.stream().getReader();
      const writable = zipper.writable(file.name);
      const writer = writable.getWriter();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        processedBytes += value.byteLength;
        onProgress?.(processedBytes / totalBytes);
        await writer.write(value);
        abortController.signal.throwIfAborted();
      }

      abortController.signal.throwIfAborted();
      await writer.close();
    }

    zipper.close();
    abortController.signal.throwIfAborted();
    await pipe;
    abortController.signal.throwIfAborted();
    const file = await handle.getFile();
    return file;
  }

  async function startUpload() {
    if (uploading) return;
    abortController = new AbortController();
    uploading = true;

    try {
      await processFiles();
    } catch (e) {
      uploading = false;
      throw e;
    }
  }

  async function processFiles() {
    if (!files?.length) {
      if (text.length === 0) return;

      return uploadSingleFile(new File([text], `file.${highlightingLanguage}`));
    }
    if (files.length === 1) return uploadSingleFile(files[0]);
    try {
      const file = await zipFiles(files, (progress) => {
        progressPercentage = progress * 100;
        buttonText = `zipping... ${roundToDecimal(progressPercentage, 2)}%`;
      });
      console.log(URL.createObjectURL(file));
      await uploadSingleFile(file);
    } catch {
      progressPercentage = 0;
      buttonText = `upload file or text`;
    }
  }

  async function uploadSingleFile(file: File) {
    abortController = new AbortController();

    const url = await upload({
      file,
      encrypt: encryptionEnabled,
      expirationDate: expiresIn + Math.floor(Date.now() / 1000),
      password: password,
      onProgress(phase, percent) {
        progressPercentage = percent;
        buttonText = `${phase}... ${roundToDecimal(percent, 2)}%`;
      },
      onErrorMessage(errMessage) {
        popupText = errMessage;
        displayingPopup = true;
      },
      abortController
    });

    goto(url);
  }

  let acknowledge: () => any = $state(() => {});

  function handleKeyUp(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "Enter") {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      processFiles();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      acknowledge();
    }
  }
</script>

<svelte:window onkeyup={handleKeyUp} />

<svelte:head>
  <title>v8p.me</title>

  <meta property="og:title" content="v8p.me" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="/" />
  <meta property="og:description" content="file uploading, encrypting, storing, and sharing" />
  <meta name="theme-color" content="#458588" />
</svelte:head>

<div class="center">
  <Module text="upload file">
    <div class="upload-file">
      <FileSelector bind:files></FileSelector>

      <div class="or-separator">
        <span class="or-line"></span>
        <span class="or-text">OR</span>
        <span class="or-line"></span>
      </div>

      <WriteText disabled={!!files?.item(0)} bind:text></WriteText>

      <div class="bottom-buttons">
        <button class="cancel" onclick={cancelUpload}>cancel</button>
        <button class="upload" onclick={startUpload} disabled={uploadButtonDisabled}>
          <div class="back-text">{buttonText}</div>
          <div class="front-text" style="clip-path: inset(0 0 0 {progressPercentage}%);">
            {buttonText}
          </div>
        </button>
      </div>
    </div>
  </Module>
  <Module text="options" collapsable>
    <div class="options">
      <label class="option-label" for="encryption"
        >encryption<Help
          text="encryption is 100% client-side. the server only ever sees the file name, size, type, and the encrypted data."
        /></label
      >
      <Switch bind:isActive={encryptionEnabled} label="encryption"></Switch>

      <label for="password" class="option-label">password</label>
      <input
        name="password"
        id="password"
        type="password"
        class="textbox"
        disabled={!encryptionEnabled}
        placeholder={encryptionEnabled ? "" : "enable encryption"}
        bind:value={password}
      />
      <ExpiryDateSelector bind:expiresIn></ExpiryDateSelector>
      <HighlightingLanguageSelector bind:highlightingLanguage disabled={!!files?.item(0)}
      ></HighlightingLanguageSelector>
    </div>
  </Module>
</div>

<Popup
  text={popupText}
  bind:displaying={displayingPopup}
  bind:submit={acknowledge}
  onCancel={cancelUpload}
></Popup>

<style lang="scss">
  @use "../vars" as *;

  @media screen and (max-height: 825px) {
    .center {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
    }
  }

  .upload-file {
    position: relative;
  }

  .or-separator {
    display: flex;

    margin: 10px 0;
    width: 100%;
  }

  .or-line {
    flex-grow: 1;
    align-self: center;

    height: $module-border;

    background-color: $bg-2;
  }

  .or-text {
    margin: 0 $padding;

    font-weight: bold;
    color: $bg-3;
  }

  .bottom-buttons {
    display: flex;

    gap: $padding;
  }

  .bottom-buttons button {
    flex-grow: 1;
  }

  .upload {
    position: relative;
  }

  .back-text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: $accent;
    color: $bg;
  }

  .front-text {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: $bg-0-soft;
    clip-path: inset(0 0 0 50%);
  }

  .options {
    display: grid;

    grid-template-rows: 1fr 1fr;
    grid-template-columns: auto auto;

    gap: $padding;
  }

  .option-label {
    display: flex;
    margin: auto 0;
  }
</style>

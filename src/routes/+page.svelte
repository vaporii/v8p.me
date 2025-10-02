<script lang="ts">
  import { goto } from "$app/navigation";
  import { fileTypes, roundToDecimal } from "$lib";
  import Module from "../components/Module.svelte";
  import Help from "../components/Help.svelte";
  import Popup from "../components/Popup.svelte";
  import WriteText from "../components/page/upload/WriteText.svelte";
  import FileSelector from "../components/page/upload/FileSelector.svelte";
  import { upload } from "$lib/uploader";
  import ExpiryDateSelector from "../components/page/options/ExpiryDateSelector.svelte";

  let abortController = new AbortController();

  let buttonDisabled = $state(false);

  let expiresIn = $state(0);

  let encryptionEnabled = $state(false);
  let buttonText = $state("upload file or text");
  let text = $state("");
  let password = $state("");
  let progressPercentage = $state(0.0);

  let popupText = $state("");
  let displayingPopup = $state(false);

  let files: FileList | undefined | null = $state();

  function toggleEncryption() {
    encryptionEnabled = !encryptionEnabled;
  }

  function cancelUploadButton() {
    abortController.abort(new Error("upload file or text"));
    files = new DataTransfer().files;
    text = "";
  }

  async function uploadFile() {
    let file = files?.item(0);
    if (!file) {
      if (text.length === 0) return;
      file = new File([text], `file.${highlightingLanguage}`);
    }

    let url = "";
    try {
      abortController = new AbortController();

      url = await upload({
        file,
        encrypt: encryptionEnabled,
        expirationDate: expiresIn + Math.floor(Date.now() / 1000),
        password: password,
        onProgress(phase, percent) {
          progressPercentage = percent;
          buttonText = `${phase}... ${roundToDecimal(percent, 2)}%`;
        },
        abortController
      });
    } catch (e) {
      if (e instanceof Error) {
        progressPercentage = 0.0;
        buttonText = e.message;
      }
    }

    goto(url);
  }

  let acknowledge: () => any = $state(() => {});

  function handleKeyUp(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === "Enter") {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      uploadFile();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      acknowledge();
    }
  }

  let highlightingLanguage = $derived(!!files?.item(0) ? "binary" : "txt");
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
      <!-- <UploadFile {file}></UploadFile> -->

      <div class="or-separator">
        <span class="or-line"></span>
        <span class="or-text">OR</span>
        <span class="or-line"></span>
      </div>

      <WriteText disabled={!!files?.item(0)} bind:text></WriteText>

      <div class="bottom-buttons">
        <button class="cancel" onclick={cancelUploadButton}>cancel</button>
        <button class="upload" onclick={uploadFile} disabled={buttonDisabled}>
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
      <button
        name="encryption"
        id="encryption"
        class="switch"
        onclick={toggleEncryption}
        aria-label="Toggle Encryption"
      >
        <div class={(encryptionEnabled ? "switch-active " : "") + "switch-circle"}></div>
      </button>

      <label for="password" class="option-label">password</label>
      <input
        name="password"
        id="password"
        type="password"
        class="textbox"
        disabled={!encryptionEnabled}
        bind:value={password}
      />
      <ExpiryDateSelector bind:expiresIn></ExpiryDateSelector>
      <label for="language" class="option-label"
        >language<Help
          text="set the language to control how written text is displayed in the file preview page."
        /></label
      >
      <select name="langs" id="langs" bind:value={highlightingLanguage} disabled={!!files?.item(0)}>
        {#each fileTypes as fileType}
          <option value={fileType.ext}>{fileType.langName} (.{fileType.ext})</option>
        {/each}
        <option value="binary">file</option>
      </select>
    </div>
  </Module>
</div>

<Popup
  text={popupText}
  bind:displaying={displayingPopup}
  bind:submit={acknowledge}
  onCancel={cancelUploadButton}
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

  .dragging {
    border: $drag-border;
  }

  .upload-icon {
    width: 45px;
    height: auto;
  }

  .big-text {
    all: unset;
    overflow: hidden;
    display: block;
    text-overflow: ellipsis;
    white-space: pre-line;
    word-wrap: break-word;

    max-height: calc(3 * 1.4em);
    width: 100%;
    line-height: 1.4em;

    font-size: $header-size;
    text-align: center;
  }

  .little-text {
    font-size: $small-font-size;
    color: $bg-4;
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

  .loading-bar {
    position: absolute;
    background-color: $accent;
    height: 100%;
    bottom: 0;
    left: 0;
    width: 100%;
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

  .help-icon {
    margin-left: $smaller-padding;
  }

  .switch {
    all: none;
    display: inline-block;
    position: relative;

    width: 62px;
    height: 33px;
    box-sizing: border-box;
    padding: 2px;
    margin-left: auto;

    border: $module-border solid $fg-1;
    background-color: $bg-0-soft;
    cursor: pointer;

    user-select: none;
  }

  .switch-circle {
    position: absolute;

    top: 2px;
    bottom: 2px;
    left: 2px;
    right: 50%;

    background-color: $fg-1;
    transition:
      left 200ms cubic-bezier(1, 0, 0, 1),
      right 200ms cubic-bezier(1, 0, 0, 1);
  }

  .switch-active {
    left: 50%;
    right: 2px;

    background-color: $fg;
  }

  .option-label {
    display: flex;
    margin: auto 0;
  }
</style>

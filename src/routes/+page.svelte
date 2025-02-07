<script lang="ts">
	import Module from '../components/Module.svelte';

  const M = {
    "B":  1,
    "KB": 1000,
    "MB": 1000000,
    "GB": 1000000000,
    "TB": 1000000000000,
  };

	let encryptionEnabled = $state(false);
  let fileName = $state("drop file here");
  let fileSize = $state("or, click to choose");
  let iconSrc = $state("/icons/upload.svg");
	let text = $state("");
	let password = $state("");

	let dragging = $state(false);

	let file: File | undefined = $state();
	
	function toggleEncryption() {
		encryptionEnabled = !encryptionEnabled;
	}

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      file = target.files[0];
      fileName = file.name;
      fileSize = formatSize(file.size);
      iconSrc = "/icons/file.svg";
    }
  }

	function cancelUpload() {
		fileName = "drop file here";
		fileSize = "or, click to choose";
		iconSrc = "/icons/upload.svg";

		file = undefined;
		text = "";

		// cancel upload process
	}

	function progressEvent(progress: ProgressEvent<XMLHttpRequestEventTarget>) {
		console.log(progress.loaded);
		console.log(progress.total);
	}

	function encryptFile(blob: Blob, password: string): Blob {
		
	}
	
	function uploadFile() {
		let blob: Blob;
		let size: number;
		let name: string;
		if (file) {
			console.log("uploading file");
			blob = new Blob([file]);
			size = file.size;
			name = file.name;
		} else if (text.length > 0) {
			console.log("uploading text");
			blob = new Blob([new TextEncoder().encode(text)]);
			name = "text.txt"; // TODO: custom names
			size = blob.size;
		} else return;

		if (encryptionEnabled) {
			if (password.length < 0) {
				alert("password empty :("); // TODO: replace with an actual error
				return;
			}

			blob = encryptFile(blob, password);
		}

		const form = new FormData();
		form.append("filename", fileName) // TODO: check filename and make sure it's umm longer than 0 characters
		form.append("filesize", size.toString());
		form.append("file", new Blob([blob]));
		
		const xhr = new XMLHttpRequest();
		xhr.open("POST", "/");
		xhr.addEventListener("progress", progressEvent);
		
		xhr.send(form);
	}

	let enterTarget: EventTarget | null; // janky fix for javascript's shitty drag and drop api
	function dropHandler(e: DragEvent) {
		e.preventDefault();
		dragging = false;

		if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
			if (e.dataTransfer.items[0].kind !== "file") return;
			file = e.dataTransfer.items[0].getAsFile() as File;

			fileName = file.name;
      fileSize = formatSize(file.size);
      iconSrc = "/icons/file.svg";
		}
	}

	function dragOverHandler(e: DragEvent) {
		e.preventDefault();
	}

	function dragEnterHandler(e: Event) {
		enterTarget = e.target;
		e.stopPropagation();
		e.preventDefault();
		dragging = true;
	}

	function dragLeaveHandler(e: Event) {
		if (enterTarget === e.target) {
			e.stopPropagation();
			e.preventDefault();
			dragging = false;
		}
	}

  function formatSize(bytes: number): string {
    let formatted = 0.0;
    let symbol = "B";
    
    if (bytes < M.KB) {
      formatted = bytes;
      symbol = "B";
    } else if (bytes < M.MB) {
      formatted = bytes / M.KB;
      symbol = "KB";
    } else if (bytes < M.GB) {
      formatted = bytes / M.MB;
      symbol = "MB";
    } else if (bytes < M.TB) {
      formatted = bytes / M.GB;
      symbol = "GB";
    } else if (bytes >= M.TB) {
      formatted = bytes / M.TB;
      symbol = "TB";
    }
    
    return (Math.round(formatted * 100) / 100) + " " + symbol;
  }
</script>

<div class="center">
	<Module text="upload file">
		<div class="upload-file">
      <input type="file" name="file-upload" id="file-upload" onchange={handleFileChange} />
      <label
				id="file-select"
				class={dragging ? "dragging" : ""}
				for="file-upload"
				ondrop={dropHandler}
				ondragover={dragOverHandler}
				ondragenter={dragEnterHandler}
				ondragleave={dragLeaveHandler}
			>
        <img src={iconSrc} alt="upload file icon" class="upload-icon" />
        <span class="big-text">{fileName}</span>
        <span class="little-text">{fileSize}</span>
      </label>
			<div class="or-separator">
				<span class="or-line"></span>
				<span class="or-text">OR</span>
				<span class="or-line"></span>
			</div>
			<textarea name="text" id="text" placeholder="write some text..." disabled={!!file} bind:value={text}></textarea>
			<div class="bottom-buttons">
				<button class="cancel" onclick={cancelUpload}>cancel</button>
				<button class="upload" onclick={uploadFile}>upload file or text</button>
			</div>
		</div>
	</Module>
	<Module text="options">
		<div class="options">
			<span class="option-label">encryption</span> <!-- NOTE: add a (?) note that tells the user it's client-side encrypted, the filename is not though -->
			<button class="switch" onclick={toggleEncryption} aria-label="Toggle Encryption">
				<div class={(encryptionEnabled ? 'switch-active ' : '') + 'switch-circle'}></div>
			</button>

			<span class="option-label">password</span>
			<input type="password" class="textbox" disabled={!encryptionEnabled} bind:value={password} />
		</div>
	</Module>
</div>

<style lang="scss">
	@use '../vars' as *;

	.center {
		position: absolute;

		min-width: 320px;
		max-width: 480px;
		width: 100%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding-bottom: $padding;
		padding-top: $top-padding;

		background-color: $bg-0;
	}

	#file-select {
		display: flex;

		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;

		width: 100%;
		min-height: 170px;
		padding: $padding;

		background-color: $bg-0-soft;
		cursor: pointer;
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

	#file-upload {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
	}

  #file-upload:focus ~ #file-select {
    outline: $focus-outline;
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

	textarea {
		width: 100%;
		height: 170px;
		margin-bottom: $padding;
	}

	.bottom-buttons {
		display: flex;

		gap: $padding;
	}

	.bottom-buttons button {
		flex-grow: 1;
	}

	.options {
		display: grid;

		grid-template-rows: 1fr 1fr;
		grid-template-columns: 0.5fr 1fr;

		gap: $padding;
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
		margin: auto 0;
	}
</style>

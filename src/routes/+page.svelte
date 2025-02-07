<script lang="ts">
	import Module from '../components/Module.svelte';

  const M = {
    "B":  1,
    "KB": 1000,
    "MB": 1000000,
    "GB": 1000000000,
    "TB": 1000000000000,
  };

	let encryptionEnabled = false;
  let fileName = "drop file here";
  let fileSize = "or, click to choose";
  let iconSrc = "/icons/upload.svg";

	function toggleEncryption() {
		encryptionEnabled = !encryptionEnabled;
	}

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      fileName = file.name;
      fileSize = formatSize(file.size);
      iconSrc = "/icons/upload.svg";
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
      <input type="file" name="file-upload" id="file-upload" />
      <label id="file-select" for="file-upload">
        <img src="{iconSrc}" alt="upload file icon" class="upload-icon" />
        <span class="big-text">{fileName}</span>
        <span class="little-text">{fileSize}</span>
      </label>
			<div class="or-separator">
				<span class="or-line"></span>
				<span class="or-text">OR</span>
				<span class="or-line"></span>
			</div>
			<textarea name="text" id="text" placeholder="write some text..."></textarea>
			<div class="bottom-buttons">
				<button class="cancel">cancel</button>
				<button class="upload">upload file or text</button>
			</div>
		</div>
	</Module>
	<Module text="options" className="options-module">
		<div class="options">
			<span class="option-label">encryption</span>
			<button class="switch" onclick={toggleEncryption} aria-label="Toggle Encryption">
				<div class={(encryptionEnabled ? 'switch-active ' : '') + 'switch-circle'}></div>
			</button>

			<span class="option-label">password</span>
			<input type="password" class="textbox" />
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

		width: 100%;
		min-height: 170px;

		background-color: $bg-0-soft;
		cursor: pointer;
	}

	.upload-icon {
		width: 45px;
		height: auto;
	}

	.big-text {
		font-size: $header-size;
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

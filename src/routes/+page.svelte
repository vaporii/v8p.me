<script lang="ts">
	import { goto } from '$app/navigation';
	import { Encryptor, formatSize, persistIfNeeded, roundToDecimal, tryRemoveFileEntry } from '$lib';
	import type { Encrypted } from '$lib/types';
	import Module from '../components/Module.svelte';

	let encryptionEnabled = $state(false);
	let fileName = $state('drop file here');
	let fileSize = $state('or, click to choose');
	let iconSrc = $state('/icons/upload.svg');
	let buttonText = $state('upload file or text');
	let text = $state('');
	let password = $state('');
	let progressPercentage = $state(0.0);

	let dragging = $state(false);

	let file: File | undefined = $state();

	const encryptor = new Encryptor();

	// function to stop uploading or encrypting at whatever step
	// set in encryption and uploading functions
	let stopUploadOrEncrypt = async () => {};

	function toggleEncryption() {
		encryptionEnabled = !encryptionEnabled;
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			file = target.files[0];
			fileName = file.name;
			fileSize = formatSize(file.size);
			iconSrc = '/icons/file.svg';
		}
	}

	async function cancelUpload() {
		fileName = 'drop file here';
		fileSize = 'or, click to choose';
		iconSrc = '/icons/upload.svg';

		file = undefined;
		text = '';

		buttonText = 'upload file or text';
		progressPercentage = 0;

		await stopUploadOrEncrypt();
	}

	function uploadProgressEvent(progress: ProgressEvent<XMLHttpRequestEventTarget>) {
		if (progress.lengthComputable) {
			progressPercentage = (progress.loaded / progress.total) * 100;
			buttonText = `uploading file... ${roundToDecimal(progressPercentage, 2)}%`;
		}
	}

	async function encryptFile(blob: Blob, password: string): Promise<Encrypted> {
		const encrypted = await encryptor.encrypt(blob, password, (loaded, total) => {
			buttonText = `encrypting file... ${roundToDecimal((loaded / total) * 100, 2)}%`;
			progressPercentage = (loaded / total) * 100;
		});

		return encrypted;
	}

	async function uploadFile() {
		buttonText = 'starting...';

		let thisFile: File;
		if (file) {
			thisFile = file;
		} else if (text.length > 0) {
			thisFile = new File([new TextEncoder().encode(text)], 'text.txt', { type: 'text/plain' });
		} else return; // TODO: error for not having file or text

		const name = thisFile.name;
		const type = thisFile.type;
		const encrypted = encryptionEnabled;

		let root: FileSystemDirectoryHandle | undefined;

		await persistIfNeeded(thisFile.size);

		if (encryptionEnabled) {
			if (password.length === 0) {
				alert('password empty :('); // TODO: replace with an actual error
				return;
			}

			root = await navigator.storage.getDirectory();
			await tryRemoveFileEntry(root, 'file_v8p.me');

			const draftHandle = await root.getFileHandle('file_v8p.me', { create: true });
			const writable = await draftHandle.createWritable();

			const stream = await encryptFile(thisFile, password);
			stopUploadOrEncrypt = async () => {
				stream.cancel();
			};

			try {
				await stream.stream.pipeTo(writable);
			} catch (e) {
				if (e) {
					alert("error encrypting file. you probably don't have enough space on your drive"); // TODO: replace with an actual error
					await cancelUpload();
				}
				return;
			}

			thisFile = await draftHandle.getFile();
		}

		const xhr = new XMLHttpRequest();
		xhr.upload.addEventListener('progress', uploadProgressEvent);

		xhr.open('POST', '/', true);

		xhr.setRequestHeader('Content-Type', 'application/octet-stream');
		xhr.setRequestHeader('X-File-Name', name);
		xhr.setRequestHeader('X-File-Type', type.length === 0 ? 'text/plain' : type);
		xhr.setRequestHeader('X-Encrypted', String(Number(encrypted)));

		// NOTE: progress only works properly on chrome for some reason?
		// NOTE: maybe not
		xhr.send(thisFile);

		stopUploadOrEncrypt = async () => {
			xhr.abort();
			root?.removeEntry('file_v8p.me');
		};

		xhr.addEventListener('readystatechange', (e) => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				root?.removeEntry('file_v8p.me');
				if (xhr.status >= 200 && xhr.status < 400) {
					buttonText = 'uploaded!';
					goto(xhr.responseText);
				} else {
					buttonText = 'failed';
				}
			}
		});
	}

	// janky fix for javascript's shitty drag and drop api
	let enterTarget: EventTarget | null;
	function dropHandler(e: DragEvent) {
		e.preventDefault();
		dragging = false;

		if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
			if (e.dataTransfer.items[0].kind !== 'file') return;
			file = e.dataTransfer.items[0].getAsFile() as File;

			fileName = file.name;
			fileSize = formatSize(file.size);
			iconSrc = '/icons/file.svg';
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
</script>

<div class="center">
	<Module text="upload file">
		<div class="upload-file">
			<input type="file" name="file-upload" id="file-upload" onchange={handleFileChange} />
			<label
				id="file-select"
				class={dragging ? 'dragging' : ''}
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
			<textarea
				name="text"
				id="text"
				placeholder="write some text..."
				disabled={!!file}
				bind:value={text}
			></textarea>
			<div class="bottom-buttons">
				<button class="cancel" onclick={cancelUpload}>cancel</button>
				<button class="upload" onclick={uploadFile}>
					<div class="back-text">{buttonText}</div>
					<div class="front-text" style="clip-path: inset(0 0 0 {progressPercentage}%);">
						{buttonText}
					</div>
				</button>
			</div>
		</div>
	</Module>
	<Module text="options">
		<div class="options">
			<span class="option-label">encryption</span>
			<!-- NOTE: add a (?) note that tells the user it's client-side encrypted, the filename is not though -->
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

	.upload-file {
		position: relative;
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

<script lang="ts">
	import {
		Encryptor,
		formatSize,
		isDisplayable,
		persistIfNeeded,
		roundToDecimal,
		tryRemoveFileEntry
	} from '$lib';
	import FileDisplay from '../../components/FileDisplay.svelte';
	import Module from '../../components/Module.svelte';
	let { data } = $props();

	let buttonDisabled = $state(false);

	let password = $state('');
	let buttonText = $state('decrypt file');
	let progressPercentage = $state(0);

	let downloadLink = $state(`/${data.alias}/direct`);
	let showDecryptScreen = $state(Boolean(data.encrypted));

	let root: FileSystemDirectoryHandle;

	const encryptor = new Encryptor();

	function convertDate(inputDate: number) {
		const date = new Date(inputDate);
		const day = new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})
			.format(date)
			.toLowerCase();
		const time = new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		})
			.format(date)
			.toLowerCase();
		return { day, time };
	}

	const date = convertDate(data.timestamp);

	function handleKeypress(e: KeyboardEvent) {
		if (e.key !== 'Enter') return;
		console.log('click');
		button?.click();
	}

	async function decryptPress() {
		buttonDisabled = true;
		await clickDecrypt();
		buttonDisabled = false;
	}

	// TODO: add some form of other encryption so you have to have the
	// password to retrieve the encrypted file from the server
	async function clickDecrypt() {
		if (password.length === 0) {
			return; // TODO: maybe replace with an error?
		}

		// user can't change it after clicking btn
		const thisPassword = password;

		root = await navigator.storage.getDirectory();
		await tryRemoveFileEntry(root, 'file_v8p.me');
		const draftHandle = await root.getFileHandle('file_v8p.me', { create: true });
		let writable = await draftHandle.createWritable();

		buttonText = 'waiting for storage...';
		await persistIfNeeded(data.fileSize);

		const req = await fetch(`/${data.alias}/direct`);
		const stream = req.body;
		if (!stream) {
			buttonText = 'failed';
			console.error('stream was somehow not present in the request');
			return;
		}

		let loaded = 0;
		const progressStream = new TransformStream({
			start(controller) {},
			transform(chunk, controller) {
				loaded += chunk.byteLength;
				progressPercentage = (loaded / data.fileSize) * 100;
				buttonText = `downloading... ${roundToDecimal(progressPercentage, 2)}%`;
				controller.enqueue(chunk);
			}
		});

		try {
			await stream.pipeThrough(progressStream).pipeTo(writable);
		} catch (e) {
			progressPercentage = 0;
			buttonText = 'failed';
			await tryRemoveFileEntry(root, 'file_v8p.me');
			console.error(e);
			return;
		}

		const file = await draftHandle.getFile();
		const encrypted = await encryptor.decrypt(file, thisPassword, (loaded, total) => {
			progressPercentage = (loaded / total) * 100;
			buttonText = `decrypting... ${roundToDecimal(progressPercentage, 2)}%`;
		});

		writable = await draftHandle.createWritable();

		try {
			await encrypted.stream.pipeTo(writable);
		} catch (e) {
			progressPercentage = 0;
			buttonText = 'failed';
			await tryRemoveFileEntry(root, 'file_v8p.me');
			console.error(e);
			return;
		}

		const url = URL.createObjectURL(await draftHandle.getFile());

		downloadLink = url;
		showDecryptScreen = false;
	}

	function beforeUnload(e: BeforeUnloadEvent) {
		tryRemoveFileEntry(root, 'file_v8p.me');
	}

	let button: HTMLButtonElement | undefined = $state();
</script>

<svelte:window on:beforeunload={beforeUnload} />

<div class="center" style={isDisplayable(data.fileName) ? 'max-width: 100%' : ''}>
	<Module text={data.encrypted ? 'password protected' : 'file'}>
		{#if showDecryptScreen}
			<input
				type="password"
				name="password"
				id="password"
				onkeypress={handleKeypress}
				bind:value={password}
			/>
			<div class="bottom">
				<div class="text">the server never sees decrypted files</div>
				<button class="upload" onclick={decryptPress} disabled={buttonDisabled} bind:this={button}>
					<div class="back-text">{buttonText}</div>
					<div class="front-text" style="clip-path: inset(0 0 0 {progressPercentage}%);">
						{buttonText}
					</div>
				</button>
			</div>
		{:else}
			<div class="wrapper">
				<div>
					<div class="filename">{data.fileName}</div>
					<div class="info">{formatSize(data.fileSize)} • {data.fileType}</div>
				</div>
				<a href={downloadLink} download={data.fileName} class="download-icon">
					<img src="/icons/download.svg" alt="download icon" srcset="" />
				</a>
			</div>
			<div class="separator"></div>
			<FileDisplay fileInfo={data} url={downloadLink}>
				<div class="separator"></div>
			</FileDisplay>
			<div class="date">
				uploaded <span class="strong">{date.day}</span> at <span class="strong">{date.time}</span>
			</div>
		{/if}
	</Module>
</div>

<style lang="scss">
	@use '../../vars' as *;

	.wrapper {
		display: flex;
		gap: $padding;
		margin-bottom: $small-padding;
	}

	.filename {
		font-weight: bold;
		font-size: $font-size;
	}

	.info {
		font-weight: bold;
		font-size: $font-size;
		color: $fg-1;
	}

	.download-icon {
		height: 40px;
		align-self: center;
		margin-left: auto;
	}

	.download-icon img {
		height: 100%;
	}

	.separator {
		// height: $module-border;
		border-top: $module-border solid $bg-2;
		width: 100%;
		margin-bottom: $small-padding;
	}

	.date {
		color: $fg-1;
	}

	.strong {
		font-weight: bold;
	}

	.bottom {
		display: flex;
	}

	#password {
		margin-bottom: $padding;
		margin-top: $smaller-padding;
	}

	.text {
		font-size: $small-font-size;
		color: $fg-1;
		align-self: center;
	}

	.upload {
		margin-left: auto;
		width: 300px;
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
</style>

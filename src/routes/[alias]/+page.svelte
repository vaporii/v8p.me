<script lang="ts">
	import { Encryptor, formatSize, roundToDecimal } from '$lib';
	import Module from '../../components/Module.svelte';
	let { data } = $props();

	let password = $state('');
	let buttonText = $state('decrypt file');
	let progressPercentage = $state(0);

	let downloadLink = $state(`/${data.alias}/direct`);
	let showDecryptScreen = $state(Boolean(data.encrypted));

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
		button?.click();
	}

	function downloadProgressEvent(progress: ProgressEvent<XMLHttpRequestEventTarget>) {
		if (progress.lengthComputable) {
			progressPercentage = (progress.loaded / progress.total) * 100;
			buttonText = `downloading... ${roundToDecimal(progressPercentage, 2)}%`;
		}
	}

	async function decryptFile(blob: Blob, password: string) {
		const decrypted = await encryptor.decrypt(blob, password, (loaded, total) => {
			progressPercentage = (loaded / total) * 100;
			buttonText = `decrypting... ${roundToDecimal(progressPercentage, 2)}%`;
		});

		return decrypted;
	}

	// TODO: add some form of other encryption so you have to have the
	// password to retrieve the encrypted file from the server
	async function clickDecrypt() {
		if (password.length === 0) {
			return; // TODO: maybe replace with an error?
		}

		// user can't change it after clicking btn
		const thisPassword = password;

		const root = await navigator.storage.getDirectory();
		const draftHandle = await root.getFileHandle('file_v8p.me', { create: true });
		const writable = await draftHandle.createWritable();

		const f = await fetch(`/${data.alias}/direct`);
		const stream = f.body;
		if (!stream) {
			buttonText = 'failed';
			console.error('stream was somehow not present in the request');
			return;
		}

		await stream.pipeTo(writable);

		const file = await draftHandle.getFile();
		const encrypted = await encryptor.decrypt(file, password, (loaded, total) => {
			console.log(loaded / total);
		});

		const draftHandle1 = await root.getFileHandle('file1_v8p.me', { create: true });
		const writable1 = await draftHandle1.createWritable();

		await encrypted.stream.pipeTo(writable1);
		
		// const url = URL.createObjectURL(file);

		// downloadLink = url;
		showDecryptScreen = false;

		// const xhr = new XMLHttpRequest();
		// xhr.responseType = 'blob';
		// xhr.open('GET', `/${data.alias}/direct`);

		// xhr.addEventListener('progress', downloadProgressEvent);

		// xhr.addEventListener('loadstart', async (e) => {
		// 	// if (xhr.readyState === XMLHttpRequest.DONE) {
		// 		if (xhr.status >= 200 && xhr.status < 400) {
		// 			const stream = await decryptFile(xhr.response, thisPassword);
		// 			console.log(xhr.response.size);

		// 			try {
		// 				await stream.stream.pipeTo(writable);
		// 			} catch (e) {
		// 				if (e) {
		// 					// nope, because incorrect password likely.
		// 					// TODO: determine between this and wrong pw
		// 					console.log(e);
		// 					alert("error decrypting file. you probably don't have enough space on your drive");
		// 				}
		// 				return;
		// 			}

		// 			// console.log(await (await draftHandle.getFile()).text());
		// 		} else {
		// 			buttonText = 'failed';
		// 		}
		// 	// }
		// });

		// xhr.send();
	}

	let button: HTMLButtonElement | undefined = $state();
</script>

<div class="center">
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
				<button class="upload" onclick={clickDecrypt}>
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
			<div class="date">
				uploaded <span class="strong">{date.day}</span> at <span class="strong">{date.time}</span>
			</div>
		{/if}
	</Module>
</div>

<style lang="scss">
	@use '../../vars' as *;

	.center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: $bg-0;
		padding-bottom: $padding;
		max-width: 100vw;
		width: $module-width;
	}

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

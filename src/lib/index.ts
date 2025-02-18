import type { Encrypted } from './types';

export class Encryptor {
	private readonly iterations = 100000;
	private readonly chunkSize = 1 * 1000 * 1000; // 1mb per chunk
	private readonly saltSize = 16;

	public async encrypt(
		blob: Blob,
		password: string,
		progress?: (loaded: number, total: number) => any
	): Promise<Encrypted> {
		const chunkSize = this.chunkSize;
		const size = blob.size;
		const salt = window.crypto.getRandomValues(new Uint8Array(this.saltSize));
		const key = await this.deriveKey(password, salt, this.iterations);
		let offset = 0;

		let cancel = () => {};

		const total = size + Math.ceil(size / this.chunkSize) * 12;

		const stream = new ReadableStream<Uint8Array>({
			async start(controller) {
				controller.enqueue(salt);
				cancel = () => {
					controller.error();
				};
			},
			async pull(controller) {
				const chunk = blob.slice(offset, offset + chunkSize);
				const chunkArrayBuffer = await chunk.arrayBuffer();
				const iv = window.crypto.getRandomValues(new Uint8Array(12));
				const encryptedChunk = await window.crypto.subtle.encrypt(
					{ name: 'AES-GCM', iv },
					key,
					chunkArrayBuffer
				);

				const data = new Blob([iv, new Uint8Array(encryptedChunk)]);
				offset += chunkSize;
				controller.enqueue(new Uint8Array(await data.arrayBuffer()));
				progress && progress(Math.min(offset, total), total);

				if (offset >= size) {
					controller.close();
				}
			}
		});

		return { stream, cancel };
	}

	public async decrypt(
		blob: Blob,
		password: string,
		progress?: (loaded: number, total: number) => any
	): Promise<Encrypted> {
		const saltSize = this.saltSize;

		// add iv size and aes-gcm 16 bit authentication tag
		const chunkSize = this.chunkSize + 12 + 16;

		const salt = await blob.slice(0, saltSize).arrayBuffer();
		const key = await this.deriveKey(password, new Uint8Array(salt), this.iterations);

		// salt takes up first bytes
		let offset = this.saltSize;
		const total = blob.size;

		let cancel = () => {};

		const stream = new ReadableStream<Uint8Array>({
			async start(controller) {
				cancel = () => {
					controller.error();
				};
			},
			async pull(controller) {
				const chunk = blob.slice(offset, offset + chunkSize);
				const chunkArrayBuffer = await chunk.arrayBuffer();
				const iv = chunkArrayBuffer.slice(0, 12);
				const ciphertext = chunkArrayBuffer.slice(12);
				try {
					let decryptedBuffer: ArrayBuffer;
					try {
						decryptedBuffer = await window.crypto.subtle.decrypt(
							{ name: 'AES-GCM', iv },
							key,
							ciphertext
						);
					} catch (e) {
						console.error('error decrypting');
						console.error(e);
						throw e;
					}

					offset += chunkSize;
					controller.enqueue(new Uint8Array(decryptedBuffer));
					progress && progress(Math.min(offset, total) - saltSize, total - saltSize);
				} catch (e) {
					controller.error(e);
				}

				if (offset >= total) {
					controller.close();
				}
			}
		});
		return { stream, cancel };
	}

	private async deriveKey(key: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
		const baseKey = await window.crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(key),
			'PBKDF2',
			false,
			['deriveKey']
		);

		const derivedKey = await window.crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt,
				iterations,
				hash: 'SHA-256'
			},
			baseKey,
			{
				name: 'AES-GCM',
				length: 256
			},
			false,
			['encrypt', 'decrypt']
		);

		return derivedKey;
	}
}

const M = {
	B: 1,
	KB: 1000,
	MB: 1000000,
	GB: 1000000000,
	TB: 1000000000000
};

export function formatSize(bytes: number): string {
	let formatted = 0.0;
	let symbol = 'B';

	if (bytes < M.KB) {
		formatted = bytes;
		symbol = 'B';
	} else if (bytes < M.MB) {
		formatted = bytes / M.KB;
		symbol = 'KB';
	} else if (bytes < M.GB) {
		formatted = bytes / M.MB;
		symbol = 'MB';
	} else if (bytes < M.TB) {
		formatted = bytes / M.GB;
		symbol = 'GB';
	} else if (bytes >= M.TB) {
		formatted = bytes / M.TB;
		symbol = 'TB';
	}

	return Math.round(formatted * 100) / 100 + ' ' + symbol;
}

export function roundToDecimal(num: number, places: number): string {
	return num.toFixed(places);
}

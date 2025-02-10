interface Encrypted {
  stream: ReadableStream<Uint8Array>;
  salt: Uint8Array,
};

export class Encryptor {
  private readonly iterations = 100000;
  private readonly chunkSize = 1 * 1000 * 1000; // 1mb per chunk
  
	public async encrypt(blob: Blob, password: string, progress?: (loaded: number, total: number) => any): Promise<Encrypted> {
    const chunkSize = this.chunkSize;
    const size = blob.size;
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await this.deriveKey(password, salt, this.iterations);
    let offset = 0;

    const total = size + Math.ceil(size / this.chunkSize) * 12;

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const chunk = blob.slice(offset, offset + chunkSize);
        const chunkArrayBuffer = await chunk.arrayBuffer();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedChunk = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          key,
          chunkArrayBuffer,
        );
  
        const data = new Blob([iv, new Uint8Array(encryptedChunk)]);
        offset += chunkSize;
        controller.enqueue(new Uint8Array(await data.arrayBuffer()));
        progress && progress(Math.min(offset, total), total);

        if (offset >= size) {
          controller.close();
        }
      },
    });
    
    return { stream, salt };
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

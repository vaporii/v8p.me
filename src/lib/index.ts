interface Encrypted {
  blob: Blob;
  salt: Uint8Array,
};

export class Encryptor {
  private readonly iterations = 100000;
  private readonly chunkSize = 5 * 1000 * 1000; // 5mb per chunk
  
	public async encrypt(blob: Blob, password: string, progress: (chunk: Uint8Array, loaded: number, total: number) => any): Promise<Encrypted> {
    const chunkSize = this.chunkSize;
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await this.deriveKey(password, salt, this.iterations);
    let offset = 0;

    const total = blob.size + Math.ceil(blob.size / this.chunkSize) * 12;

    new ReadableStream({
      pull(controller) {
        if (offset >= blob.size) {
          controller.close();
          return;
        }

        const chunk = blob.slice(offset, offset + this.chunkSize);
        const chunkArrayBuffer = await chunk.arrayBuffer();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedChunk = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          key,
          chunkArrayBuffer,
        );
  
        const data = new Blob([iv, new Uint8Array(encryptedChunk)]);
        offset += chunkSize;
      },
    });

    while (offset < blob.size) {
      const chunk = blob.slice(offset, offset + this.chunkSize);
      const chunkArrayBuffer = await chunk.arrayBuffer();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedChunk = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        chunkArrayBuffer,
      );

      const data = new Blob([iv, new Uint8Array(encryptedChunk)]);
      offset += this.chunkSize;
      
      progress && progress(, Math.min(total, offset), total);
    }
    
    return { blob: running, salt };
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
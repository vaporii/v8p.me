import type { Statement } from 'better-sqlite3';

export interface FileInfo {
	alias: string;
	fileName: string;
	timestamp: number;
	fileType: string;
	encrypted: number;
	filePath: string;
}

export interface Statements {
	insertFileInfo: Statement<
		[
			alias: string,
			fileName: string,
			timestamp: number,
			fileType: string,
			encrypted: number,
			filePath: string
		],
		void
	>;
	getFileInfo: Statement<[alias: string], FileInfo>;
}

export interface ClientFileInfo {
	fileName: string;
	fileType: string;
	encrypted: number;
}

export interface Encrypted {
	stream: ReadableStream<Uint8Array>;
	salt: Uint8Array;
	cancel: () => void;
}

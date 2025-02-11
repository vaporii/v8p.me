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
	insertFileInfo: Statement<[string, string, number, string, number, string], FileInfo>;
}

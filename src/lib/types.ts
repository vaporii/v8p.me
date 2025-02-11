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
	insertFileInfo: Statement<[alias: string, fileName: string, timestamp: number, fileType: string, encrypted: number, filePath: string], FileInfo>;
}

export interface ClientFileInfo {
  fileName: string;
  fileType: string;
  encrypted: number;
}
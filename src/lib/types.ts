import type { Statement } from 'better-sqlite3';

export interface FileInfo {
  alias: string;
  fileName: string;
  timestamp: number;
  fileType: string;
  encrypted: number;
  filePath: string;
  fileSize: number;
}

export interface Statements {
  insertFileInfo: Statement<
    [
      alias: string,
      fileName: string,
      timestamp: number,
      fileType: string,
      encrypted: number,
      filePath: string,
      fileSize: number
    ],
    void
  >;
  getFileInfo: Statement<[alias: string], FileInfo>;
}

export interface ClientFileInfo {
  fileName: string;
  fileType: string;
  fileSize: number;
  encrypted: number;
}

export interface Encrypted {
  stream: ReadableStream<Uint8Array>;
  cancel: () => void;
}

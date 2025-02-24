import type { Statement } from "better-sqlite3";

export interface FileInfo {
  alias: string;
  fileName: string;
  timestamp: number;
  fileType: string;
  encrypted: number;
  filePath: string;
  fileSize: number;
  expirationDate: number | null;
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
      fileSize: number,
      expirationDate: number | null
    ],
    void
  >;
  getFileInfo: Statement<[alias: string], FileInfo>;
  getExpiredFiles: Statement<[], FileInfo[]>;
  deleteFile: Statement<[alias: string], void>;
}

export interface ClientFileInfo {
  fileName: string;
  fileType: string;
  fileSize: number;
  encrypted: number;
  expirationDate: number | null;
}

export interface Encrypted {
  stream: ReadableStream<Uint8Array>;
  cancel: () => void;
}

import type { Statements } from "$lib/types";
import sqlite3 from "better-sqlite3";
import env from "dotenv";
env.config();

export const db = sqlite3(process.env.DB_PATH);

const query = `CREATE TABLE IF NOT EXISTS files(
  alias VARCHAR(255) PRIMARY KEY,
  fileName TEXT NOT NULL,
  timestamp INTEGER NOT NULL, -- milliseconds
  fileType TEXT NOT NULL,
  encrypted INTEGER NOT NULL, -- 0 or 1
  filePath TEXT NOT NULL UNIQUE,
  fileSize INTEGER NOT NULL, -- bytes
  expirationDate INTEGER -- seconds
)`;

db.exec(query);

export const statements: Statements = {
  insertFileInfo: db.prepare(
    "INSERT INTO files(alias, fileName, timestamp, fileType, encrypted, filePath, fileSize, expirationDate) VALUES(?, ?, ?, ?, ?, ?, ?, ?)"
  ),
  getFileInfo: db.prepare("SELECT * FROM files WHERE alias=?"),
  getExpiredFiles: db.prepare("SELECT * FROM files WHERE expirationDate < strftime('%s', 'now') + 60"),
  deleteFile: db.prepare("DELETE FROM files WHERE alias=?")
};

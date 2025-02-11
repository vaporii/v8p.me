import type { Handle } from '@sveltejs/kit';

import sqlite3 from 'better-sqlite3';
import env from 'dotenv';
env.config();

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.locals.db) {
		const db = sqlite3(process.env.DB_PATH);

		event.locals.db = db;

		// alias, filepath, filename, encrypted?, timestamp, filetype, passwordHash
		const query = `CREATE TABLE IF NOT EXISTS files(
                    alias VARCHAR(255) PRIMARY KEY,
                    fileName TEXT NOT NULL,
                    timestamp INTEGER NOT NULL,
                    fileType TEXT NOT NULL,
                    encrypted INTEGER NOT NULL,
                    filePath TEXT NOT NULL UNIQUE
                  )`;
		db.exec(query);
	}

	if (!event.locals.filesPath) {
		if (!process.env.FILES_DIR) {
			throw new Error('FILES_DIR environment variable not defined');
		}
		event.locals.filesPath = process.env.FILES_DIR;
	}

	if (!event.locals.stmts) {
		event.locals.stmts = {
			insertFileInfo: event.locals.db.prepare(
				'INSERT INTO files(alias, fileName, timestamp, fileType, encrypted, filePath) VALUES(?, ?, ?, ?, ?, ?)'
			)
		};
	}

	const resp = await resolve(event);
	return resp;
};

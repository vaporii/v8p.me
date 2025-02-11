import type { RequestHandler } from '@sveltejs/kit';
import type { Database } from 'better-sqlite3';
import * as fs from 'fs';
import path from 'path';

function generateRandomString(length: number): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789';
	const array = new Uint32Array(length);
	crypto.getRandomValues(array);
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars[array[i] % chars.length];
	}
	return result;
}

async function writeFile(filePath: string, reader: ReadableStreamDefaultReader<Uint8Array>) {
    const writeStream = fs.createWriteStream(filePath);

    writeStream.addListener('error', (err) => {
        throw err;
    });

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        await new Promise<void>((res, rej) => {
            writeStream.write(value, (e) => {
                if (e) rej(e);
                else res();
            });
        });
    }

    await new Promise<void>((res, rej) => {
        writeStream.close((err) => {
            if (err) rej(err);
            else res();
        });
    });
}

export const POST: RequestHandler = async ({ request, locals }) => {
	const reader = request.body?.getReader();
	if (!reader) return new Response(null, { status: 400 });

    const db = locals.db;

	const fileName = generateRandomString(50);
	const filePath = path.join(locals.filesPath, fileName);

    try {
        await writeFile(filePath, reader);
    } catch (e) {
        console.error(e);
        return new Response("Unexpected error while writing file", { status: 500 })
    }
    

	return new Response();
};

import type { ClientFileInfo } from "$lib/types";
import type { RequestHandler } from "@sveltejs/kit";
import type { Database } from "better-sqlite3";
import * as fs from "fs";
import path from "path";

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

function processHeaders(req: Request): ClientFileInfo {
  const fileName = req.headers.get("X-File-Name");
  const fileType = req.headers.get("X-File-Type");
  const fileSize = req.headers.get("X-File-Size");
  const encrypted = req.headers.get("X-Encrypted");
  const expirationDate = req.headers.get("X-Expiration-Date");
  if (!fileName) throw new Error("X-File-Name header missing");
  if (!fileType) throw new Error("X-File-Type header missing");
  if (!fileSize || isNaN(Number(fileSize)))
    throw new Error("X-File-Size header missing or invalid");
  if (!encrypted || isNaN(Number(encrypted)))
    throw new Error("X-Encrypted header missing or invalid");
  if (expirationDate && isNaN(Number(expirationDate)))
    throw new Error("X-Expiration-Date header invalid");

  return {
    fileName: decodeURIComponent(fileName),
    fileType,
    fileSize: Number(fileSize),
    encrypted: Number(encrypted),
    expirationDate: Number(expirationDate) || null
  };
}

async function writeFile(filePath: string, reader: ReadableStreamDefaultReader<Uint8Array>) {
  const writeStream = fs.createWriteStream(filePath);

  writeStream.addListener("error", (err) => {
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

  const fileName = generateRandomString(50);
  const filePath = path.join(locals.filesPath, fileName);

  try {
    await writeFile(filePath, reader);
  } catch (e) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("error unlinking file", e);
    }
    console.error(e);
    return new Response("Unexpected error while writing file", { status: 500 });
  }

  let clientHeaders: ClientFileInfo;
  try {
    clientHeaders = processHeaders(request);
  } catch (e) {
    if (e instanceof Error) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("error unlinking file", e);
      }
      return new Response(e.message, { status: 400 });
    }
    throw e;
  }

  const alias = generateRandomString(locals.aliasLength);

  locals.stmts.insertFileInfo.run(
    alias,
    clientHeaders.fileName,
    Date.now(),
    clientHeaders.fileType,
    clientHeaders.encrypted,
    filePath,
    clientHeaders.fileSize,
    clientHeaders.expirationDate
  ); // TODO: implement basic caching, load some aliases into memory instead of getting from db each time

  return new Response(alias);
};

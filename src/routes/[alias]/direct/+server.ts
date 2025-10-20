import fs, { createReadStream, statSync } from "fs";
import type { RequestHandler } from "@sveltejs/kit";
import { createReadableStream } from "@sveltejs/kit/node";

export const GET: RequestHandler = async ({ request, params, locals }) => {
  const { alias } = params;
  if (!alias) {
    return new Response("alias is not defined", { status: 400 });
  }

  const fileData = locals.stmts.getFileInfo.get(alias);
  if (!fileData) {
    return new Response(null, { status: 404 });
  }

  try {
    const { size } = statSync(fileData.filePath, { throwIfNoEntry: true });
    const range = request.headers.get("range");

    if (!range) {
      const file = createReadableStream(fileData.filePath);

      return new Response(file, {
        headers: {
          "Content-Type": fileData.fileType,
          "Content-Length": size.toString(),
          "Accept-Ranges": "bytes"
        }
      });
    }

    const matches = /bytes=(\d*)-(\d*)/.exec(range);
    if (!matches) {
      return new Response("invalid range", { status: 416 });
    }

    let start = matches[1] ? parseInt(matches[1], 10) : 0;
    let end = matches[2] ? parseInt(matches[2], 10) : size - 1;

    if (start >= size || end >= size) {
      return new Response("range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` }
      });
    }

    if (end < start) end = start;

    const chunkSize = end - start + 1;
    const stream = createReadStream(fileData.filePath, { start, end });

    return new Response(stream as any, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": fileData.fileType
      }
    });
  } catch (e) {
    console.error(e);
    return new Response("error retrieving file", { status: 500 });
  }
};

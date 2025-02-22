import fs, { statSync } from "fs";
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
    const file = createReadableStream(fileData.filePath);

    return new Response(file, {
      headers: { "Content-Type": fileData.fileType, "Content-Length": size.toString() }
    });
  } catch (e) {
    console.error(e);
    return new Response("error retrieving file", { status: 500 });
  }
};

import type { FileInfo } from "$lib/types.js";
import { error } from "@sveltejs/kit";

export async function load({ params, locals }): Promise<FileInfo> {
  const fileInfo = locals.stmts.getFileInfo.get(params.alias);
  if (!fileInfo) {
    return error(404, "alias not found");
  }

  const { alias, encrypted, fileName, filePath, fileType, timestamp, fileSize, expirationDate } =
    fileInfo;

  return {
    alias,
    encrypted,
    fileName,
    filePath,
    fileType,
    timestamp,
    fileSize,
    expirationDate
  };
}

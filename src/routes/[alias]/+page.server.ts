import type { FileInfo } from "$lib/types.js";

export async function load({ params, locals }): Promise<FileInfo> {
  const fileInfo = locals.stmts.getFileInfo.get(params.alias);
  if (!fileInfo) {
    throw new Error("alias doesn't exist");
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

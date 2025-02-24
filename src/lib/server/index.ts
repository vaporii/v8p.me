import fs from "fs";
import type { Statements } from "$lib/types";

export async function runBackgroundTasks(stmts: Statements) {
  const files = stmts.getExpiredFiles.get();
  if (!files) return;

  for (const file of files) {
    if (!file.expirationDate) {
      console.error("file doesn't expire (somehow)", file);
      continue;
    }

    setTimeout(
      () => {
        try {
          stmts.deleteFile.run(file.alias);
          fs.unlinkSync(file.filePath); // TODO: add safety net for security
        } catch (e) {
          console.error("error deleting file on system", file);
          console.error(e);
        }

        console.log("deleted file", file);
      },
      Math.max(1, file.expirationDate - Math.floor(Date.now()))
    );
  }
}

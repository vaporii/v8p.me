import fs from "fs";
import type { Statements } from "$lib/types";

export async function runBackgroundTasks(stmts: Statements) {
  const files = stmts.getExpiredFiles.all();
  if (!files) return;

  for (const file of files) {
    if (!file.expirationDate) {
      console.error("file doesn't expire (somehow)", file.alias, file.filePath);
      continue;
    }

    console.log(
      "deleting file " + file.alias + " in",
      Math.max(1, file.expirationDate - Math.floor(Date.now() / 1000)),
      "seconds"
    );
    setTimeout(
      () => {
        try {
          stmts.deleteFile.run(file.alias);
          fs.unlinkSync(file.filePath); // TODO: add safety net for security
        } catch (e) {
          console.error("error deleting file on system", file.alias, file.filePath);
          console.error(e);
        }

        console.log("deleted file", file.alias);
      },
      Math.max(1, file.expirationDate - Math.floor(Date.now() / 1000)) * 1000
    );
  }
}

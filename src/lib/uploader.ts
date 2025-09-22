import { Encryptor, persistIfNeeded, tryRemoveFileEntry } from "$lib";

export type UploadOptions = {
  file: File;
  encrypt?: boolean;
  password?: string;
  expirationDate?: number;
  onProgress?: (phase: "encrypting" | "uploading", percent: number) => void;
  onStateChange?: (
    state: "init" | "upload" | "upload_complete" | "encrypt" | "encrypt_complete" | "end"
  ) => void;
  onError?: (err: Error) => void;
  abortController?: AbortController;
};

export async function upload({
  file,
  encrypt = false,
  password = "",
  expirationDate = 0,
  onProgress = (_phase, _percent) => {},
  onStateChange: stateChange = (_state) => {},
  onError = (_err) => {},
  abortController = new AbortController()
}: UploadOptions): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const { signal } = abortController;
    signal.throwIfAborted();

    stateChange("init");
    const encryptor = new Encryptor();
    let workingFile = file;
    let root: FileSystemDirectoryHandle | undefined;

    try {
      if (encrypt) {
        if (!password) throw new Error("password empty");

        if (!(await persistIfNeeded(file.size))) {
          onError(
            new Error(
              "persistent storage could not be enabled. some large files may not load properly or entirely"
            )
          );
        }

        signal.throwIfAborted();
        root = await navigator.storage.getDirectory();

        signal.throwIfAborted();
        await tryRemoveFileEntry(root, "file_v8p.me");

        const draftHandle = await root.getFileHandle("file_v8p.me", { create: true });
        const writable = await draftHandle.createWritable();

        stateChange("encrypt");

        console.log(password);
        const stream = await encryptor.encrypt(workingFile, password, (loaded, total) => {
          onProgress("encrypting", (loaded / total) * 100);
        });
        signal.throwIfAborted();

        signal.onabort = () => {
          stream.cancel();
          reject(signal.reason);
        };

        await stream.stream.pipeTo(writable);
        signal.throwIfAborted();

        workingFile = await draftHandle.getFile();
        signal.throwIfAborted();

        stateChange("encrypt_complete");
        signal.onabort = null;
      } else {
        await persistIfNeeded(workingFile.size);
      }

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress("uploading", (e.loaded / e.total) * 100);
        }
      });

      xhr.open("POST", "/api", true);

      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
      xhr.setRequestHeader("X-File-Type", file.type.length === 0 ? "text/plain" : file.type);
      xhr.setRequestHeader("X-File-Size", workingFile.size.toString());
      xhr.setRequestHeader("X-Encrypted", String(Number(encrypt)));
      if (expirationDate > 0) {
        xhr.setRequestHeader("X-Expiration-Date", expirationDate.toString());
      }

      xhr.send(workingFile);

      signal.onabort = (e) => {
        xhr.abort();
        root?.removeEntry("file_v8p.me");
        reject(signal.reason);
      };

      xhr.addEventListener("loadstart", (e) => {
        stateChange("upload");
      });

      xhr.addEventListener("readystatechange", (e) => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          root?.removeEntry("file_v8p.me");
          if (xhr.status >= 200 && xhr.status < 400) {
            stateChange("upload_complete");
            resolve(xhr.responseText);
          } else {
            signal.throwIfAborted();
            stateChange("end");
            onError(new Error(xhr.statusText));
            reject(new Error(xhr.statusText));
          }
        }
      });
    } catch (err) {
      stateChange("end");
      onError(Error.isError(err) ? err : new Error("error"));
      reject(err);
    }
  });
}

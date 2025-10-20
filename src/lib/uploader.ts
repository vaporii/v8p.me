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
  onErrorMessage?: (errMessage: string) => void;
  abortController?: AbortController;
};

export async function getStorageFileHandle(
  filename: string,
  { signal }: { signal?: AbortSignal }
): Promise<FileSystemFileHandle> {
  signal?.throwIfAborted();

  const root = await navigator.storage.getDirectory();

  signal?.throwIfAborted();
  await tryRemoveFileEntry(root, filename);

  signal?.throwIfAborted();
  const fileHandle = await root.getFileHandle(filename, { create: true });

  return fileHandle;
}

export async function upload({
  file,
  encrypt = false,
  password = "",
  expirationDate = 0,
  onProgress = (_phase, _percent) => {},
  onStateChange: stateChange = (_state) => {},
  onErrorMessage = (_err) => {},
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
        if (!password) {
          onErrorMessage(
            "encryption is enabled, but the password is empty. please enter a password to encrypt a file"
          );
          reject(new Error("no password"));
          return;
        }

        if (!(await persistIfNeeded(file.size))) {
          onErrorMessage(
            "persistent storage could not be enabled. some large files may not load properly or entirely"
          );
        }

        signal.throwIfAborted();

        const draftHandle = await getStorageFileHandle("file_v8p.me", { signal });
        const writable = await draftHandle.createWritable();
        root = await navigator.storage.getDirectory();

        stateChange("encrypt");

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
            onErrorMessage(
              "unexpected server error. try again later, and submit a github issue if you're feeling kind"
            );
            reject(new Error(xhr.statusText));
          }
        }
      });
    } catch (err) {
      stateChange("end");
      onErrorMessage(
        "unexpected error. try again later, and submit a github issue if you're feeling kind"
      );
      reject(err);
    }
  });
}

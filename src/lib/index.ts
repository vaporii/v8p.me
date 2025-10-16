import * as langs from "svelte-highlight/languages";
import type { Encrypted } from "./types";
import type { LanguageType } from "svelte-highlight/languages";

export class Encryptor {
  private readonly iterations = 100000;
  private readonly chunkSize = 1 * 1000 * 1000; // 1mb per chunk
  private readonly saltSize = 16;

  public async encrypt(
    blob: Blob,
    password: string,
    progress?: (loaded: number, total: number) => any
  ): Promise<Encrypted> {
    const chunkSize = this.chunkSize;
    const size = blob.size;
    const salt = window.crypto.getRandomValues(new Uint8Array(this.saltSize));
    const key = await this.deriveKey(password, salt, this.iterations);
    let offset = 0;

    let cancel = () => {};

    const total = size + Math.ceil(size / this.chunkSize) * 12;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(salt);
        cancel = () => {
          controller.error();
        };
      },
      async pull(controller) {
        const chunk = blob.slice(offset, offset + chunkSize);
        const chunkArrayBuffer = await chunk.arrayBuffer();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedChunk = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          key,
          chunkArrayBuffer
        );

        const data = new Blob([iv, new Uint8Array(encryptedChunk)]);
        offset += chunkSize;
        controller.enqueue(new Uint8Array(await data.arrayBuffer()));
        progress && progress(Math.min(offset, total), total);

        if (offset >= size) {
          controller.close();
        }
      }
    });

    return { stream, cancel };
  }

  public async decrypt(
    blob: Blob,
    password: string,
    progress?: (loaded: number, total: number) => any
  ): Promise<Encrypted> {
    const saltSize = this.saltSize;

    // add iv size and aes-gcm 16 bit authentication tag
    const chunkSize = this.chunkSize + 12 + 16;

    const salt = await blob.slice(0, saltSize).arrayBuffer();
    const key = await this.deriveKey(password, new Uint8Array(salt), this.iterations);

    // salt takes up first bytes
    let offset = this.saltSize;
    const total = blob.size;

    let cancel = () => {};

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        cancel = () => {
          controller.error();
        };
      },
      async pull(controller) {
        const chunk = blob.slice(offset, offset + chunkSize);
        const chunkArrayBuffer = await chunk.arrayBuffer();
        const iv = chunkArrayBuffer.slice(0, 12);
        const ciphertext = chunkArrayBuffer.slice(12);
        try {
          let decryptedBuffer: ArrayBuffer;
          decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
          );

          offset += chunkSize;
          controller.enqueue(new Uint8Array(decryptedBuffer));
          progress && progress(Math.min(offset, total) - saltSize, total - saltSize);
        } catch (e) {
          controller.error(e);
        }

        if (offset >= total) {
          controller.close();
        }
      }
    });
    return { stream, cancel };
  }

  private async deriveKey(key: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      { name: "PBKDF2", iterations, hash: "SHA-256", salt: new Uint8Array(salt) },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    return derivedKey;
  }
}

const M = { B: 1, KB: 1000, MB: 1000000, GB: 1000000000, TB: 1000000000000 };

export function formatSize(bytes: number): string {
  let formatted = 0.0;
  let symbol = "B";

  if (bytes < M.KB) {
    formatted = bytes;
    symbol = "B";
  } else if (bytes < M.MB) {
    formatted = bytes / M.KB;
    symbol = "KB";
  } else if (bytes < M.GB) {
    formatted = bytes / M.MB;
    symbol = "MB";
  } else if (bytes < M.TB) {
    formatted = bytes / M.GB;
    symbol = "GB";
  } else if (bytes >= M.TB) {
    formatted = bytes / M.TB;
    symbol = "TB";
  }

  return Math.round(formatted * 100) / 100 + " " + symbol;
}

export function roundToDecimal(num: number, places: number): string {
  return num.toFixed(places);
}

export async function tryRemoveFileEntry(
  root: FileSystemDirectoryHandle,
  entry: string
): Promise<boolean> {
  try {
    await root.removeEntry(entry, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export async function requestPersistentStorage() {
  if (!(await navigator.storage.persist())) {
    alert(
      "persistent storage could not be enabled. some large files may not load properly or entirely"
    ); // TODO: replace this with an actual error (see figma design sheet)
  }
}

export async function persistIfNeeded(size: number) {
  const quota = (await navigator.storage.estimate()).quota;
  if (!quota || size * 2 > quota) {
    return await navigator.storage.persist();
  }
  return true;
}

export const fileTypes: { ext: string; lang: LanguageType<string>; langName: string }[] = [
  { ext: "1c", lang: langs._1c, langName: "_1c" },
  { ext: "ahk", lang: langs.autohotkey, langName: "autohotkey" },
  { ext: "as", lang: langs.actionscript, langName: "actionscript" },
  { ext: "asm", lang: langs.x86asm, langName: "x86asm" },
  { ext: "awk", lang: langs.awk, langName: "awk" },
  { ext: "bf", lang: langs.brainfuck, langName: "brainfuck" },
  { ext: "c", lang: langs.c, langName: "c" },
  { ext: "cmake", lang: langs.cmake, langName: "cmake" },
  { ext: "cpp", lang: langs.cpp, langName: "cpp" },
  { ext: "cs", lang: langs.csharp, langName: "csharp" },
  { ext: "css", lang: langs.css, langName: "css" },
  { ext: "d", lang: langs.d, langName: "d" },
  { ext: "dockerfile", lang: langs.dockerfile, langName: "dockerfile" },
  { ext: "dos", lang: langs.dos, langName: "dos" },
  { ext: "fsh", lang: langs.glsl, langName: "glsl" },
  { ext: "glsl", lang: langs.glsl, langName: "glsl" },
  { ext: "go", lang: langs.go, langName: "go" },
  { ext: "haml", lang: langs.haml, langName: "haml" },
  { ext: "html", lang: langs.xml, langName: "xml" },
  { ext: "http", lang: langs.http, langName: "http" },
  { ext: "ini", lang: langs.ini, langName: "ini" },
  { ext: "java", lang: langs.java, langName: "java" },
  { ext: "js", lang: langs.javascript, langName: "javascript" },
  { ext: "json", lang: langs.json, langName: "json" },
  { ext: "lua", lang: langs.lua, langName: "lua" },
  { ext: "makefile", lang: langs.makefile, langName: "makefile" },
  { ext: "md", lang: langs.markdown, langName: "markdown" },
  { ext: "mjs", lang: langs.javascript, langName: "javascript" },
  { ext: "mts", lang: langs.typescript, langName: "typescript" },
  { ext: "nix", lang: langs.nix, langName: "nix" },
  { ext: "php", lang: langs.php, langName: "php" },
  { ext: "ps1", lang: langs.powershell, langName: "powershell" },
  { ext: "py", lang: langs.python, langName: "python" },
  { ext: "q", lang: langs.q, langName: "q" },
  { ext: "r", lang: langs.r, langName: "r" },
  { ext: "rb", lang: langs.ruby, langName: "ruby" },
  { ext: "rs", lang: langs.rust, langName: "rust" },
  { ext: "scala", lang: langs.scala, langName: "scala" },
  { ext: "scss", lang: langs.scss, langName: "scss" },
  { ext: "sh", lang: langs.bash, langName: "bash" },
  { ext: "sh", lang: langs.shell, langName: "shell" },
  { ext: "sql", lang: langs.sql, langName: "sql" },
  { ext: "tp", lang: langs.tp, langName: "tp" },
  { ext: "ts", lang: langs.typescript, langName: "typescript" },
  { ext: "txt", lang: langs.plaintext, langName: "plaintext" },
  { ext: "vim", lang: langs.vim, langName: "vim" },
  { ext: "vsh", lang: langs.glsl, langName: "glsl" },
  { ext: "wasm", lang: langs.wasm, langName: "wasm" },
  { ext: "xml", lang: langs.xml, langName: "xml" },
  { ext: "yaml", lang: langs.yaml, langName: "yaml" }
  // { ext: '', lang: langs.},
];

export function isDisplayable(fileName: string, fileType?: string): boolean {
  let typeDisplayable = false;
  if (fileType) {
    const types = ["image", "video", "text"]; // removed audio because it makes it too big
    const splitType = fileType.split("/");
    const type = splitType[0];
    typeDisplayable = types.includes(type);
  }

  const split = fileName.split(".");
  const ext = split[split.length - 1];

  return (
    typeDisplayable ||
    !!fileTypes.find((type) => {
      return type.ext === ext;
    })
  );
}

export function convertDate(inputDate: number) {
  const date = new Date(inputDate);
  const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
    .format(date)
    .toLowerCase();
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  })
    .format(date)
    .toLowerCase();
  return { day, time };
}

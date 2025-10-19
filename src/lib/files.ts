export async function traverseEntry(
  files: File[],
  entry: FileSystemEntry,
  path: string
): Promise<void> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    await new Promise<void>((resolve, reject) => {
      fileEntry.file((file) => {
        const relativeFile = new File([file], path + file.name, { type: file.type });
        files.push(relativeFile);
        resolve();
      }, reject);
    });
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const reader = dirEntry.createReader();

    await new Promise<void>((resolve, reject) => {
      const readEntries = () => {
        reader.readEntries(async (entries) => {
          if (entries.length === 0) return resolve();
          for (const e of entries) {
            await traverseEntry(files, e, path + dirEntry.name + "/");
          }
          readEntries();
        }, reject);
      };
      readEntries();
    });
  }
}

export async function getFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<FileList> {
  const items = Array.from(dataTransfer.items);
  const files: File[] = [];

  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) await traverseEntry(files, entry, "");
  }

  const dataTransferForOutput = new DataTransfer();
  for (const f of files) dataTransferForOutput.items.add(f);
  return dataTransferForOutput.files;
}

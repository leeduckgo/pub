interface FilesStore {
  isFetched: Boolean;
  files: Array<any>;
  setFiles: Function;
  updateFiles: Function;
  updateFile: Function;
}

const sortByUpdatedAt = (files: any) => {
  return files.sort((f1: any, f2: any) => {
    return new Date(f2.updatedAt).getTime() - new Date(f1.updatedAt).getTime();
  });
};

export function createFilesStore() {
  return {
    isFetched: false,
    files: [],
    setFiles(files: any) {
      this.isFetched = true;
      const sortedFiles = sortByUpdatedAt(files);
      this.files = sortedFiles;
    },
    updateFiles(file: any) {
      this.files = this.files.map(item => {
        if (+item.id === +file.id) item.status = file.status;
        return item;
      });
    },
    updateFile(file: any, idx: number) {
      this.files[idx] = file;
    },
  } as FilesStore;
}

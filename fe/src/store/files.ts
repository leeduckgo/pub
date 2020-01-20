interface FilesStore {
  isFetched: Boolean;
  files: Array<any>;
  setFiles: Function;
  updateFile: Function;
  updateFileByIdx: Function;
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
    updateFile(file: any) {
      this.files = this.files.map(item => {
        if (+item.id === +file.id) {
          return file;
        }
        return item;
      });
    },
    updateFileByIdx(file: any, idx: number) {
      this.files[idx] = file;
    },
    addFile(file: any) {
      this.files.unshift(file);
    },
    removeFile(id: any) {
      this.files = this.files.filter(file => +file.id !== +id);
    },
  } as FilesStore;
}

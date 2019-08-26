interface FilesStore {
  isFetched: Boolean;
  files: Array<any>;
  setFiles: Function;
  updateFiles: Function;
  updateFile: Function;
}

export function createFilesStore() {
  return {
    isFetched: false,
    files: [],
    setFiles(files: any) {
      this.isFetched = true;
      this.files = files;
    },
    updateFiles(file: any) {
      this.files = this.files.map(item => {
        if (+item.id === +file.id) item.status = file.status;
        return item;
      });
    },
    updateFile(file: any, idx: number) {
      this.files[idx] = file;
    }
  } as FilesStore;
}

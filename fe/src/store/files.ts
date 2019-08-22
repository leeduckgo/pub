interface FilesStore {
  files: Array<any>;
  setFiles: Function;
  updateFiles: Function;
}

export function createFilesStore() {
  const filesStore: FilesStore = {
    files: [],
    setFiles(files: any) {
      this.files = files;
    },
    updateFiles(file: any) {
      this.files = this.files.map(item => {
        if (+item.id === +file.id) item.status = file.status;
        return item;
      })
    }
  }
  return filesStore;
}
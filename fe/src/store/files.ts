export function createFilesStore() {
  return {
    files: [],
    setFiles(files: any) {
      this.files = files;
    }
  };
}

export function createSnackbarStore() {
  return {
    isOpenning: false,
    msg: '',
    open(msg: string) {
      this.msg = msg;
      this.isOpenning = true;
    },
    close() {
      this.isOpenning = false;
      this.msg = '';
    }
  };
}

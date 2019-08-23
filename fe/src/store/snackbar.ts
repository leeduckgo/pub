export function createSnackbarStore() {
  return {
    isOpenning: false,
    msg: '',
    autoHideDuration: 2000,
    open(msg: string, duration = 2000) {
      this.msg = msg;
      this.autoHideDuration = duration;
      this.isOpenning = true;
    },
    close() {
      this.isOpenning = false;
      this.msg = '';
    },
  };
}

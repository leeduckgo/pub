export function createSnackbarStore() {
  return {
    isOpenning: false,
    msg: '',
    type: 'default',
    autoHideDuration: 2000,
    open(msg: string, duration = 2000, type?: string) {
      this.msg = msg;
      this.type = type || this.type;
      this.autoHideDuration = duration;
      this.isOpenning = true;
    },
    close() {
      this.isOpenning = false;
      this.msg = '';
      this.type = 'default';
    }
  };
}

export function createSnackbarStore() {
  return {
    isOpenning: false,
    msg: '',
    type: 'default',
    open(msg: string, type?: string) {
      this.msg = msg;
      this.type = type || this.type;
      this.isOpenning = true;
    },
    close() {
      this.isOpenning = false;
      this.msg = '';
      this.type = 'default';
    }
  };
}

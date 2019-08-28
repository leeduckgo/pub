export function createSnackbarStore() {
  return {
    isOpenning: false,
    msg: '',
    type: 'default',
    autoHideDuration: 2000,
    meta: {},
    open(msg: string, duration = 2000, type?: string, meta = {}) {
      this.msg = msg;
      this.type = type || this.type;
      this.autoHideDuration = duration;
      this.isOpenning = true;
      this.meta = meta;
    },
    close() {
      this.isOpenning = false;
      this.msg = '';
      this.type = 'default';
    },
  };
}

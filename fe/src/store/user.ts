export function createUserStore() {
  return {
    isFetched: false,
    isLogin: false,
    user: {},
    setUser(user: any) {
      this.user = user;
      this.isLogin = true;
    },
    setIsFetched(status: boolean) {
      this.isFetched = status;
    },
  };
}

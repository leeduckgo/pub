export function createUserStore() {
  return {
    isFetched: false,
    isLogin: false,
    user: {},
    setUser(user: any) {
      this.user = user;
      this.isLogin = true;
    },
    setIsFetched() {
      this.isFetched = true;
    },
  };
}

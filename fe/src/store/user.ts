export function createUserStore() {
  return {
    isFetched: false,
    isLogin: false,
    avatar: '',
    name: '',
    bio: '',
    setUser(user: any) {
      this.isLogin = true;
      this.avatar = user.avatar;
      this.name = user.name;
      this.bio = user.bio;
    },
    setIsFetched() {
      this.isFetched = true;
    },
  };
}

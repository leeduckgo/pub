export function createUserStore() {
  return {
    isFetched: false,
    isLogin: false,
    isTopicOwner: false,
    id: 0,
    avatar: '',
    name: '',
    bio: '',
    setUser(user: any) {
      this.isLogin = true;
      this.id = user.id;
      this.avatar = user.avatar;
      this.name = user.name;
      this.bio = user.bio;
      this.isTopicOwner = user.isTopicOwner;
    },
    setIsFetched() {
      this.isFetched = true;
    },
  };
}

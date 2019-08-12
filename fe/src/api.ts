import request from './request';

export default {
  fetchUser() {
    return request('/api/user');
  },
};

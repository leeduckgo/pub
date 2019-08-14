import request from './request';

export default {
  fetchUser() {
    return request('/api/user');
  },
  getFiles() {
    return request('/api/files')
  }
};

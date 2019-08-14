import request from './request';

export default {
  fetchUser() {
    return request('/api/user');
  },
  getFiles() {
    return request('/api/files')
  },
  createFile(file: any) {
    file.mimeType = 'text/markdown';
    let payload = { payload: file }
    const path = '/api/files';
    return request(path, {
      method: 'POST',
      body: payload
    });
  },
  getFile(id: any) {
    return request(`/api/files/${id}`)
  }
};

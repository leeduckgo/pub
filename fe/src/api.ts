import request from './request';

export default {
  fetchUser() {
    return request('/api/user');
  },
  getFiles() {
    return request('/api/files')
  },
  createDraft(file: any) {
    const path = '/api/files?type=DRAFT';
    file.mimeType = file.mimeType || 'text/markdown';
    const payload = { payload: file }
    return request(path, {
      method: 'POST',
      body: payload
    });
  },
  createFile(file: any) {
    const path = '/api/files';
    delete file.id;
    file.mimeType = file.mimeType || 'text/markdown';
    const payload = { payload: file }
    return request(path, {
      method: 'POST',
      body: payload
    });
  },
  getFile(id: any) {
    return request(`/api/files/${id}`)
  },
  updateFile(file: any, publish?: boolean) {
    const path = publish ? `/api/files/${file.id}?action=PUBLISH` : `/api/files/${file.id}`;
    delete file.id;
    delete file.userId;
    delete file.msghash;
    delete file.createdAt;
    delete file.updatedAt;
    delete file.status;
    file.mimeType = file.mimeType || 'text/markdown';
    const payload = { payload: file }
    return request(path, {
      method: 'PUT',
      body: payload
    });
  },
  deleteFile(id: any) {
    return request(`/api/files/${id}`, {
      method: 'DELETE'
    })
  },
};

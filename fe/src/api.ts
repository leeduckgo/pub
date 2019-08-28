import request from './request';

export default {
  fetchUser() {
    return request('/api/user');
  },
  getFiles() {
    return request('/api/files');
  },
  createDraft(file: any) {
    const path = '/api/files?type=DRAFT';
    file.mimeType = file.mimeType || 'text/markdown';
    const payload = { payload: file };
    return request(path, {
      method: 'POST',
      body: payload,
    });
  },
  createFile(file: any) {
    const path = '/api/files';
    file.mimeType = file.mimeType || 'text/markdown';
    const payload = { payload: file };
    return request(path, {
      method: 'POST',
      body: payload,
    });
  },
  getFile(id: any) {
    return request(`/api/files/${id}`);
  },
  updateFile(id: number | undefined, file: any, publish?: boolean) {
    const path = publish ? `/api/files/${id}?action=PUBLISH` : `/api/files/${id}`;
    file.mimeType = file.mimeType || 'text/markdown';
    const payload = { payload: file };
    return request(path, {
      method: 'PUT',
      body: payload,
    });
  },
  deleteFile(id: any) {
    return request(`/api/files/${id}`, {
      method: 'DELETE',
    });
  },
};

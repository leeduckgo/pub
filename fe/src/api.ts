import request from './request';

export interface TopicPermissionResult {
  count: number
  users: Array<{
    id: string
    name: string
    avatar: string
  }>
}

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
  importArticle(url: string) {
    return request(`/api/import/?url=${encodeURIComponent(url)}`, {
      method: 'POST',
    });
  },
  fetchSettings() {
    return request(`/api/settings`);
  },
  fetchTopicAllowedUsers(p: { offset: number, limit: number }) {
    return request(`/api/topics/allow?offset=${p.offset}&limit=${p.limit}`) as Promise<TopicPermissionResult>;
  },
  fetchTopicDeniedUsers(p: { offset: number, limit: number }) {
    return request(`/api/topics/deny?offset=${p.offset}&limit=${p.limit}`) as Promise<TopicPermissionResult>;
  },
  allowTopicUser(userId: string) {
    return request(`/api/topics/allow/${userId}`, { method: 'POST' });
  },
  denyTopicUser(userId: string) {
    return request(`/api/topics/deny/${userId}`, { method: 'POST' });
  },
};

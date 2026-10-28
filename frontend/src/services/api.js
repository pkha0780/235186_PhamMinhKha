import { API_URL } from '../config.js';

export class ApiError extends Error {
  constructor(message, { status = 0, details = [] } = {}) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new ApiError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend và thử lại.');
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(body.message || `Yêu cầu thất bại (${response.status})`, {
      status: response.status,
      details: body.errors || [],
    });
  }
  return body;
}

export const booksApi = {
  list: (search = '') =>
    request(`/api/books${search ? `?search=${encodeURIComponent(search)}` : ''}`).then((b) => b.data),
  get: (id) => request(`/api/books/${encodeURIComponent(id)}`).then((b) => b.data),
  create: (data) => request('/api/books', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/books/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/api/books/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

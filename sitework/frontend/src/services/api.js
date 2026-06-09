import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('swn_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Global error handling
api.interceptors.response.use(
  r => r.data,
  e => {
    if (e.response?.status === 401) {
      localStorage.removeItem('swn_token');
      window.location.href = '/';
    }
    return Promise.reject(e.response?.data || e);
  }
);

export default api;

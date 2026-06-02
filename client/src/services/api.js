import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fwc_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fwc_token');
      localStorage.removeItem('fwc_user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  }
);

export default api;
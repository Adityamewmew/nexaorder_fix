import axios from 'axios';
import { store } from '@/store';
import { logout } from '@/features/auth/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'ngrok-skip-browser-warning': 'true', // Melewati peringatan browser ngrok
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexa_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexa_token');
      store.dispatch(logout());
    }
    return Promise.reject(err);
  }
);

export default api;

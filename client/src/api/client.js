import axios from 'axios';

const client = axios.create({ baseURL: '/' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('lpg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('lpg_token');
      localStorage.removeItem('lpg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

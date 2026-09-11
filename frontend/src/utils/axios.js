import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5001/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    /*
     * When sending FormData, the browser must
     * automatically generate the multipart boundary.
     */
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response &&
      error.response.status === 401
    ) {
      localStorage.removeItem(
        'token'
      );

      window.location.href =
        '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
// src/lib/axiosClient.ts

import Axios from "axios";

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  },
});

axios.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos 401 y no hemos intentado refresh todavía
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/v1/auth/refresh' &&
      originalRequest.url !== '/api/v1/auth/logout'
    ) {
      originalRequest._retry = true;

      try {
        // Intentar obtener un nuevo token
        const { data } = await axios.post('/api/v1/auth/refresh');
        const newToken = data.access_token;

        // Guardar nuevo token
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', newToken);
        }

        // Actualizar header del request original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Reintentar el request original con el nuevo token
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh falló → hacer logout completo
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;

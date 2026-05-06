// src/lib/axiosClient.ts

import Axios from "axios";

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
  },
  // Custom params serializer to properly encode brackets for JSON:API
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      }
      return searchParams.toString();
    }
  }
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

    // On 401: clear invalid token and let useAuth handle redirect
    // Do NOT use window.location.href (causes full page reload loop)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/login' &&
      originalRequest.url !== '/api/auth/logout'
    ) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
    }

    return Promise.reject(error);
  }
);

export default axios;

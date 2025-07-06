// src/lib/axiosClient.ts

import Axios from "axios"

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
})

// Interceptor para agregar token Bearer desde localStorage
axios.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí puedes manejar expiraciones de sesión, redirecciones, etc.
    return Promise.reject(error)
  }
)

export default axios

// src/modules/auth/lib/profileApi.ts
import axiosClient from "@/lib/axiosClient";
import { parseJsonApiErrors } from "@/lib/parseJsonApiErrors";

/**
 * Obtener información del usuario autenticado
 */
async function getCurrentUser() {
  const res = await axiosClient.get("/api/v1/profile");
  return res.data?.data?.attributes ?? null;
}

/**
 * Cambiar la contraseña del usuario autenticado
 * Accepts camelCase payload and transforms to API format
 */
async function changePassword(payload: {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}) {
  return axiosClient
    .patch("/api/v1/profile/password", {
      currentPassword: payload.currentPassword,
      password: payload.password,
      passwordConfirmation: payload.passwordConfirmation,
    })
    .then((res) => res.data)
    .catch((error) => {
      // Si es un error 422 de validación, extraemos los errores y los lanzamos en el formato esperado
      if (error.response?.status === 422 && error.response.data?.errors) {
        const parsedErrors = parseJsonApiErrors(error.response.data.errors);
        throw parsedErrors;
      }
      // Para otros tipos de errores, relanzamos el error original
      throw error;
    });
}

/**
 * Actualizar informacion del perfil del usuario
 */
async function updateProfile(payload: {
  name?: string;
  email?: string;
  phone?: string;
}) {
  const res = await axiosClient.patch("/api/v1/profile", {
    data: {
      type: "users",
      attributes: payload
    }
  });
  return res.data?.data?.attributes ?? null;
}

/**
 * Subir avatar del usuario
 */
async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await axiosClient.post("/api/v1/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return res.data?.data?.attributes ?? null;
}

export { 
    getCurrentUser, 
    changePassword, 
    updateProfile, 
    uploadAvatar 
};

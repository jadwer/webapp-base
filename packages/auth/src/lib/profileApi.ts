// src/modules/auth/lib/profileApi.ts
import axiosClient from '../lib/axiosClient';
import { parseJsonApiErrors } from '@lwm/primitives';

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
      current_password: payload.currentPassword,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
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
 * Actualizar el nombre del usuario (2026-09-30: el backend ya no acepta
 * correo ni estado desde el perfil; eso se administra en Usuarios).
 */
async function updateProfile(payload: { name: string }) {
  const res = await axiosClient.patch("/api/v1/profile", { name: payload.name });
  return res.data?.data?.attributes ?? null;
}

/**
 * Subir foto de perfil (JPG, PNG o WEBP, hasta 2 MB).
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

/**
 * Elegir uno de los avatares ilustrados (1 a AVATAR_PRESET_COUNT).
 */
async function setAvatarPreset(preset: number) {
  const res = await axiosClient.post("/api/v1/profile/avatar", { preset });
  return res.data?.data?.attributes ?? null;
}

/**
 * Quitar el avatar (vuelve a las iniciales).
 */
async function removeAvatar() {
  const res = await axiosClient.delete("/api/v1/profile/avatar");
  return res.data?.data?.attributes ?? null;
}

export { 
    getCurrentUser, 
    changePassword, 
    updateProfile,
    uploadAvatar,
    setAvatarPreset,
    removeAvatar
};

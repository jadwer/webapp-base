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
 */
async function changePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return axiosClient
    .patch("/api/v1/profile/password", payload)
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

//TODO:

function updateProfile() {
  console.log("TODO: updateProfile");
  return true;
}

function uploadAvatar() {
  console.log("TODO: updateProfile");
  return true;
}

export { 
    getCurrentUser, 
    changePassword, 
    updateProfile, 
    uploadAvatar 
};

"use client";

import useSWR from "swr";
import axios from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import { parseJsonApiErrors } from "@/lib/parseJsonApiErrors";

import {
  UseAuthOptions,
  AuthErrorHandler,
  AuthStatusHandler,
  ForgotPasswordParams,
  ResetPasswordParams,
  ResendEmailVerificationParams,
} from "../types/auth.types";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      errors?: unknown[];
      message?: string;
    };
  };
}

export const useAuth = ({ middleware }: UseAuthOptions = {}) => {
  const router = useRouter();

  const shouldFetch = typeof window !== "undefined" && !!localStorage.getItem("access_token");

  const {
    data: user,
    error,
    mutate,
  } = useSWR(
    shouldFetch ? "/api/v1/profile" : null,
    (url) =>
      axios
        .get(url)
        .then((res) => {
          const userData = res.data?.data
          const finalUser = {
            id: parseInt(userData?.id),
            ...userData?.attributes
          }
          return finalUser
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            if (middleware === "auth") {
              router.replace(
                `/auth/login?redirect=${window.location.pathname}`
              );
            }
            return null;
          } else if (error.response?.status === 409) {
            router.push("/verify-email");
            return null;
          } else {
            throw error;
          }
        }),
    { shouldRetryOnError: false }
  );

const isLoading = shouldFetch && !user && !error;

  const register = async ({
    setErrors,
    ...props
  }: AuthErrorHandler & Record<string, unknown>): Promise<boolean> => {
    setErrors({});

    try {
      await axios.post("/api/auth/register", props);
      await mutate();
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 422) {
        const jsonApiErrors = apiError.response.data?.errors ?? [];
        const parsed = parseJsonApiErrors(jsonApiErrors);
        setErrors?.(parsed);
        return false;
      } else {
        throw error;
      }
    }
  };

  const login = async ({
    setErrors,
    setStatus,
    ...props
  }: AuthStatusHandler & Record<string, unknown>): Promise<boolean> => {
    try {
      setErrors?.({});
      setStatus?.(null);

      const res = await axios.post("/api/auth/login", props);
      const token = res.data.access_token;

      if (token) {
        localStorage.setItem("access_token", token);
      }

      await mutate();
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const status = apiError.response?.status;

      // 🔴 422 - Validación con JSON:API
      if (status === 422 && Array.isArray(apiError.response?.data?.errors)) {
        const parsed = parseJsonApiErrors(apiError.response.data.errors);
        setErrors?.(parsed);
        return false;
      }

      // 🔴 401 - Credenciales inválidas
      if (status === 401) {
        const msg = apiError.response?.data?.message || "Credenciales inválidas";
        setStatus?.(msg);
        return false;
      }

      // 🔴 403 - Sin permisos
      if (status === 403) {
        setStatus?.("No tienes permiso para realizar esta acción");
        return false;
      }

      // 🔴 500+ - Error interno
      if (status && status >= 500) {
        setStatus?.("Error del servidor. Intenta más tarde.");
        return false;
      }

      // 🔴 Desconocido
      console.error("Error inesperado en login:", error);
      setStatus?.("Ocurrió un error inesperado.");
      return false;
    }
  };

  const logout = async () => {
    try {
      // 1. Invalidar token en el backend
      await axios.post("/api/auth/logout");
    } catch (error) {
      // Log error pero continuar con logout local
      // No queremos bloquear el logout si el backend falla
      console.error("Backend logout failed:", error);
    } finally {
      // 2. Limpieza local (SIEMPRE ejecutar)
      localStorage.removeItem("access_token");

      // 3. Limpiar caché de SWR
      await mutate(null);

      // 4. Redirigir al login
      router.replace("/auth/login");
    }
  };

  const forgotPassword = async ({
    setErrors,
    setStatus,
    email,
  }: ForgotPasswordParams): Promise<boolean> => {
    setErrors({});
    setStatus(null);

    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      setStatus(response.data.message);
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 422) {
        const jsonApiErrors = apiError.response.data?.errors;
        if (Array.isArray(jsonApiErrors)) {
          const parsed = parseJsonApiErrors(jsonApiErrors);
          setErrors(parsed);
        } else if (jsonApiErrors && typeof jsonApiErrors === 'object') {
          setErrors(jsonApiErrors as Record<string, string[]>);
        }
        return false;
      }
      setStatus("Ocurrio un error inesperado.");
      return false;
    }
  };

  const resetPassword = async ({
    setErrors,
    setStatus,
    token,
    email,
    password,
    password_confirmation,
  }: ResetPasswordParams): Promise<boolean> => {
    setErrors({});
    setStatus(null);

    try {
      const response = await axios.post("/api/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation,
      });
      setStatus(response.data.message);
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 422) {
        const errors = apiError.response.data?.errors;
        if (Array.isArray(errors)) {
          const parsed = parseJsonApiErrors(errors);
          setErrors(parsed);
        } else if (errors && typeof errors === 'object') {
          setErrors(errors as Record<string, string[]>);
        }
        const msg = apiError.response.data?.message;
        if (msg) setStatus(msg);
        return false;
      }
      setStatus("Ocurrio un error inesperado.");
      return false;
    }
  };

  const resendEmailVerification = async ({
    setStatus,
  }: ResendEmailVerificationParams): Promise<void> => {
    try {
      const response = await axios.post("/api/auth/email/verification-notification");
      setStatus(response.data.message);
    } catch {
      setStatus("Error al enviar el correo de verificacion.");
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    resendEmailVerification,
    error,
  };
};

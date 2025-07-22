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
  ResendEmailVerificationParams,
} from "../types/auth.types";

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
        .then((res) => res.data?.data?.attributes)
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
  }: AuthErrorHandler & Record<string, unknown>) => {
    setErrors({});

    axios
      .post("/api/auth/register", props)
      .then(() => mutate())
      .catch((error) => {
        if (error.response?.status === 422) {
          const jsonApiErrors = error.response.data.errors ?? [];
          const parsed = parseJsonApiErrors(jsonApiErrors);
          setErrors?.(parsed);
        } else {
          throw error;
        }
      });
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
    } catch (error: any) {
      const status = error.response?.status;

      // 🔴 422 - Validación con JSON:API
      if (status === 422 && Array.isArray(error.response.data?.errors)) {
        const parsed = parseJsonApiErrors(error.response.data.errors);
        setErrors?.(parsed);
        return false;
      }

      // 🔴 401 - Credenciales inválidas
      if (status === 401) {
        const msg = error.response?.data?.message || "Credenciales inválidas";
        setStatus?.(msg);
        return false;
      }

      // 🔴 403 - Sin permisos
      if (status === 403) {
        setStatus?.("No tienes permiso para realizar esta acción");
        return false;
      }

      // 🔴 500+ - Error interno
      if (status >= 500) {
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
    localStorage.removeItem("access_token");
    await mutate(null);
    router.replace("/auth/login");
  };

  const forgotPassword = async ({
    setErrors,
    setStatus,
    email,
  }: ForgotPasswordParams) => {
    setErrors({});
    setStatus(null);

    axios
      .post("/forgot-password", { email })
      .then((response) => setStatus(response.data.status))
      .catch((error) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);
        } else {
          throw error;
        }
      });
  };

  const resendEmailVerification = ({
    setStatus,
  }: ResendEmailVerificationParams) => {
    axios
      .post("/email/verification-notification")
      .then((response) => setStatus(response.data.status));
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    register,
    login,
    logout,
    forgotPassword,
    resendEmailVerification,
    error,
  };
};

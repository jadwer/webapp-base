"use client";

import useSWR from "swr";
import axios from "@/lib/axiosClient";
import { useRouter } from "next/navigation";

import {
  UseAuthOptions,
  AuthErrorHandler,
  AuthStatusHandler,
  ForgotPasswordParams,
  ResendEmailVerificationParams,
} from "../types/auth.types";

export const useAuth = ({
  middleware,
}: UseAuthOptions = {}) => {
  const router = useRouter();

  const shouldFetch = middleware !== "guest";

  const {
    data: user,
    error,
    mutate,
  } = useSWR(
    shouldFetch ? "/api/v1/profile" : null,
    (url) =>
      axios
        .get(url)
        .then((res) => res.data)
        .catch((error) => {
          if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            if (middleware === "auth") {
              router.replace(`/auth/login?redirect=${window.location.pathname}`);
            }
          } else if (error.response?.status === 409) {
            router.push("/verify-email");
          } else {
            throw error;
          }
        }),
    { shouldRetryOnError: false }
  );

  const isLoading = !user && !error;

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
          setErrors(error.response.data.errors);
        } else {
          throw error;
        }
      });
  };

  const login = async ({
    setErrors,
    setStatus,
    ...props
  }: AuthStatusHandler & Record<string, unknown>) => {
    setErrors({});
    setStatus(null);

    axios
      .post("/api/auth/login", props)
      .then((res) => {
        const token = res.data.access_token;
        if (token) {
          localStorage.setItem("access_token", token);
        }
        mutate();
        const redirectTo = new URLSearchParams(window.location.search).get("redirect");
        router.replace(redirectTo || "/");
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data.errors);
        } else if (error.response?.status === 403) {
          setStatus("Este usuario no tiene acceso.");
        } else {
          throw error;
        }
      });
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
    axios.post("/email/verification-notification").then((response) =>
      setStatus(response.data.status)
    );
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

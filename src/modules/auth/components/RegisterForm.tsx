"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  RegisterFormData,
} from "@/modules/auth/schemas/register.schema";
import { useAuth } from "@/modules/auth/lib/auth";
import { handleApiErrors } from "@/modules/auth/lib/handleApiErrors";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusMessage from "@/ui/StatusMessage";

export function RegisterForm() {
  const { register: registerUser } = useAuth({
    middleware: "guest",
    redirectIfAuthenticated: "/dashboard",
  });

  const router = useRouter();

  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<
    "success" | "danger" | "info" | "warning"
  >("info");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        ...data,
        setErrors: (apiErrors) => {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages)
              ? messages.join(", ")
              : String(messages);

            setError(field as keyof RegisterFormData, {
              type: "manual",
              message: msg,
            });
          });
        },
        setStatus: (msg) => {
          setStatus(msg);
          setStatusType("danger");
        },
      });

      setStatus("Registro exitoso. Redirigiendo al login...");
      setStatusType("success");
      setTimeout(() => router.replace("/auth/login?registered=true"), 3000);
    } catch (error) {
      handleApiErrors(
        error,
        (apiErrors) => {
          Object.entries(apiErrors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages)
              ? messages.join(", ")
              : String(messages);

            setError(field as keyof RegisterFormData, {
              type: "manual",
              message: msg,
            });
          });
        },
        (msg) => {
          setStatus(msg);
          setStatusType("danger");
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <StatusMessage message={status} type={statusType} />

      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          {...register("name")}
          autoFocus
        />
        {errors.name && (
          <div className="invalid-feedback">{errors.name.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          {...register("email")}
        />
        {errors.email && (
          <div className="invalid-feedback">{errors.email.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          {...register("password")}
        />
        {errors.password && (
          <div className="invalid-feedback">{errors.password.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="password_confirmation" className="form-label">
          Confirmar contraseña
        </label>
        <input
          id="password_confirmation"
          type="password"
          className={`form-control ${
            errors.password_confirmation ? "is-invalid" : ""
          }`}
          {...register("password_confirmation")}
        />
        {errors.password_confirmation && (
          <div className="invalid-feedback">
            {errors.password_confirmation.message}
          </div>
        )}
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Registrarme
        </button>
      </div>
    </form>
  );
}

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
import { Input } from "@/ui/components/base";

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
        setStatus: (msg: string | null) => {
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
        <Input
          id="name"
          type="text"
          label="Nombre completo"
          placeholder="Tu nombre completo"
          leftIcon="bi-person"
          errorText={errors.name?.message}
          autoFocus
          {...register("name")}
        />
      </div>

      <div className="mb-3">
        <Input
          id="email"
          type="email"
          label="Correo electrónico"
          placeholder="tu@email.com"
          leftIcon="bi-envelope"
          errorText={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="mb-3">
        <Input
          id="password"
          type="password"
          label="Contraseña"
          placeholder="Tu contraseña"
          leftIcon="bi-lock"
          errorText={errors.password?.message}
          {...register("password")}
        />
      </div>

      <div className="mb-3">
        <Input
          id="password_confirmation"
          type="password"
          label="Confirmar contraseña"
          placeholder="Confirma tu contraseña"
          leftIcon="bi-lock-fill"
          errorText={errors.password_confirmation?.message}
          {...register("password_confirmation")}
        />
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary">
          Registrarme
        </button>
      </div>
    </form>
  );
}

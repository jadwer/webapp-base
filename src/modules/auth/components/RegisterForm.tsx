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
import styles from "@/modules/auth/styles/LoginForm.module.scss";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
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
        <div style={{ position: 'relative' }}>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Contraseña"
            placeholder="Tu contraseña"
            leftIcon="bi-lock"
            errorText={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggle}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div style={{ position: 'relative' }}>
          <Input
            id="passwordConfirmation"
            type={showPasswordConfirmation ? 'text' : 'password'}
            label="Confirmar contraseña"
            placeholder="Confirma tu contraseña"
            leftIcon="bi-lock-fill"
            errorText={errors.passwordConfirmation?.message}
            {...register("passwordConfirmation")}
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
            className={styles.passwordToggle}
            aria-label={showPasswordConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <i className={`bi ${showPasswordConfirmation ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        </div>
      </div>

      <div className="d-grid">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Registrando...
            </>
          ) : (
            'Registrarme'
          )}
        </button>
      </div>
    </form>
  );
}

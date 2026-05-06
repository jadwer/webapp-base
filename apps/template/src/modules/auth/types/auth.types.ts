import { User } from '@/lib/permissions'

export interface UseAuthOptions {
  middleware?: "auth" | "guest"
  redirectIfAuthenticated?: string
}

export interface AuthErrorHandler {
  setErrors: (errors: Record<string, string[]>) => void
}

export interface AuthStatusHandler extends AuthErrorHandler {
  setStatus: (status: string | null) => void
}

export interface ForgotPasswordParams extends AuthStatusHandler {
  email: string
}

export interface ResetPasswordParams extends AuthStatusHandler {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export interface ResendEmailVerificationParams {
  setStatus: (status: string) => void
}

// Re-exportar User para compatibilidad
export type { User }

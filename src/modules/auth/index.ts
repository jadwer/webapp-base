// src/modules/auth/index.ts
// ============================================
// Auth Module - Clean Exports
// ============================================

// ============================================
// COMPONENTS
// ============================================
export { default as AuthStatus } from './components/AuthStatus'
export { default as AuthenticatedLayout } from './components/AuthenticatedLayout'
export { default as ChangePasswordForm } from './components/ChangePasswordForm'
export { ForgotPasswordForm } from './components/ForgotPasswordForm'
export { LoginForm } from './components/LoginForm'
export { default as ProfileInfo } from './components/ProfileInfo'
export { RegisterForm } from './components/RegisterForm'
export { ResetPasswordForm } from './components/ResetPasswordForm'

// ============================================
// TEMPLATES
// ============================================
export { default as ForgotPasswordTemplate } from './templates/ForgotPasswordTemplate'
export { default as LoginTemplate } from './templates/LoginTemplate'
export { default as RegisterTemplate } from './templates/RegisterTemplate'
export { default as ResetPasswordTemplate } from './templates/ResetPasswordTemplate'
export { default as ProfileLayout } from './templates/ProfileLayout'

// ============================================
// HOOKS & SERVICES
// ============================================
export { useAuth } from './lib/auth'
export {
  getCurrentUser,
  changePassword,
  updateProfile,
  uploadAvatar,
} from './lib/profileApi'
export { handleApiErrors } from './lib/handleApiErrors'

// ============================================
// TYPES
// ============================================
export type {
  UseAuthOptions,
  AuthErrorHandler,
  AuthStatusHandler,
  ForgotPasswordParams,
  ResetPasswordParams,
  ResendEmailVerificationParams,
  User,
} from './types/auth.types'

// ============================================
// SCHEMAS
// ============================================
export { loginSchema, type LoginFormData } from './schemas/login.schema'
export {
  registerSchema,
  type RegisterFormData,
} from './schemas/register.schema'
export {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from './schemas/forgot-password.schema'
export {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from './schemas/reset-password.schema'

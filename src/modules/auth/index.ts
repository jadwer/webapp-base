// src/modules/auth/index.ts
// ============================================
// Auth Module - Clean Exports
// ============================================

// ============================================
// COMPONENTS
// ============================================
export { AuthStatus } from './components/AuthStatus'
export { default as AuthenticatedLayout } from './components/AuthenticatedLayout'
export { ChangePasswordForm } from './components/ChangePasswordForm'
export { LoginForm } from './components/LoginForm'
export { ProfileInfo } from './components/ProfileInfo'
export { RegisterForm } from './components/RegisterForm'

// ============================================
// TEMPLATES
// ============================================
export { default as LoginTemplate } from './templates/LoginTemplate'
export { default as RegisterTemplate } from './templates/RegisterTemplate'
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

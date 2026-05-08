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
// Re-export parseJsonApiErrors so consumers can get JSON:API error parsing
// from the package that owns the HTTP client (auth). Source of truth still
// lives in @lwm/ui to avoid duplication; @lwm/ui keeps its own export too.
export { parseJsonApiErrors } from '@lwm/ui'

// ============================================
// HTTP CLIENT
// ============================================
// axiosClient lives here because @lwm/auth owns the Bearer token interceptor.
// Other packages import it as: import axiosClient from '@lwm/auth'
export { default as axiosClient } from './lib/axiosClient'

// ============================================
// PERMISSION HELPERS
// ============================================
export {
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAnyPermission,
  isAdmin,
  isSuperAdmin,
  getUserRoles,
  getUserPermissions,
  getDefaultRoute,
  canAccessPage,
  PAGE_PERMISSIONS,
} from './lib/permissions'
export type { Permission, Role } from './lib/permissions'

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

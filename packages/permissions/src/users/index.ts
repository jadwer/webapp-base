/**
 * Users sub-module (v2, patron contacts).
 * SWR + paginacion server-side + multi-rol via relationship escribible.
 */

// Components
export { UsersAdminPage } from './components/UsersAdminPage'
export { UsersTable } from './components/UsersTable'
export { UsersPagination } from './components/UsersPagination'
export { UserForm, generateSecurePassword } from './components/UserForm'
export { UserViewPage } from './components/UserViewPage'

// Hooks
export { useUsers, useUser, useUserMutations } from './hooks/useUsers'
export { useRoleOptions } from './hooks/useRoleOptions'

// Services
export { usersService, DEFAULT_PAGE_SIZE } from './services/usersService'
export { getRoleOptions } from './services/rolesService'

// Utils
export { getUserValidationErrorMessages } from './utils/jsonApiErrors'

// Types
export type {
  User,
  UserRole,
  UserStatus,
  UserFilters,
  UserFormData,
  UsersMeta,
  UsersPageMeta,
  UsersListResult,
} from './types/user'

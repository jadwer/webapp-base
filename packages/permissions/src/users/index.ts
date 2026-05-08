/**
 * Users Module
 * User management system with role assignment
 */

// Components
export { default as UserForm } from './components/UserForm'
export { default as UserTable } from './components/UserTable'

// Templates
export { default as UsersCrudTemplate } from './templates/UsersCrudTemplate'

// Hooks
export { useUsers } from './hooks/useUsers'
export { useRoles } from './hooks/useRoles'
export { useUserForm } from './hooks/useUserForm'

// Services
export {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from './services/usersService'
export { getAllRoles } from './services/rolesService'

// Types
export type { User, Role } from './types/user'

// Componentes
export { RolesTable } from './components/RolesTable'
export { RoleForm } from './components/RoleForm'
export { PermissionMatrix } from './components/PermissionMatrix'

// Hooks
export { useRoles, useRole, useRoleActions, useRoleStats } from './hooks/useRoles'
export { usePermissions, useGroupedPermissions, usePermissionSearch } from './hooks/usePermissions'

// Servicios
export { rolesService } from './services/rolesService'
export { permissionsService } from './services/permissionsService'

// Tipos
export type { Role, Permission, RoleFormData, RoleWithPermissions } from './types/role'

// Páginas
export { default as RolesPage } from './pages/RolesPage'
export { default as PermissionManagerPage } from './pages/PermissionManagerPage'

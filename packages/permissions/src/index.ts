// @lwm/permissions — RBAC (permissions + roles + users management).
//
// Three sub-modules merged. Some symbols collide between sub-modules
// (`usePermissions`, `Permission`, `permissionsService`) so each export
// is enumerated explicitly; if a name already exists at the top level it
// keeps the permissions/* version and the others are aliased.

// ============================================
// Permissions sub-module (CRUD of individual permission rows)
// ============================================
export type { Permission, PermissionFormData } from './types/permission'
export * from './services/permissionsService'
export * from './hooks/usePermissions'
export { default as PermissionsTable } from './components/PermissionsTable'
export { default as PermissionForm } from './components/PermissionForm'
export { default as PermissionModal } from './components/PermissionModal'
export { default as SimpleConfirmModal } from './components/SimpleConfirmModal'
export { default as SimpleToast } from './components/SimpleToast'
export { default as PermissionsCrudTemplate } from './templates/PermissionsCrudTemplate'

// ============================================
// Roles sub-module
// ============================================
export { RolesTable, RoleForm, PermissionMatrix } from './roles'
export { useRoles, useRole, useRoleActions, useRoleStats } from './roles'
// rolesService and the role-typed permissions services + Permission/Role
// types from the roles sub-module live there with `roles` namespace prefix
// to avoid clashing with the top-level Permission type above.
export {
  rolesService,
  permissionsService as rolesPermissionsService,
} from './roles'
export type {
  Role,
  Permission as RolePermission,
  RoleFormData,
  RoleWithPermissions,
} from './roles'
export {
  usePermissions as useRolePermissions,
  useGroupedPermissions,
  usePermissionSearch,
} from './roles'
export { RolesPage, PermissionManagerPage } from './roles'

// ============================================
// Users sub-module
// ============================================
export * from './users'

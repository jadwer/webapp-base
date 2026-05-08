// Compatibility shim. Permission helpers and User type now live in @lwm/auth.
// Existing imports `from '@/lib/permissions'` keep working through this re-export.
// Future cleanup pass replaces them with `from '@lwm/auth'`.
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
} from '@lwm/auth'
export type { Permission, Role, User } from '@lwm/auth'

/**
 * Sucursales: la pantalla de administracion vive aqui; el nucleo (tipos,
 * servicio, hook, filtro) esta en @lwm/auth y se reexporta para no romper
 * imports existentes.
 */

export { BranchesAdmin } from './BranchesAdmin'
export { BranchFilter, useBranchName, useBranches, BRANCHES_KEY, branchesService, transformBranch } from '@lwm/auth'
export type { Branch, BranchFormData } from '@lwm/auth'

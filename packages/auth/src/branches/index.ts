/**
 * Sucursales (multi-sucursal, 2026-09). Nucleo en @lwm/auth porque lo usan
 * ventas, compras, facturacion, inventario y usuarios (todos dependen de
 * auth); la pantalla de administracion vive en @lwm/permissions.
 */

export { BranchFilter, useBranchName } from './BranchFilter'
export { BranchSelect, useSelectableBranches } from './BranchSelect'
export { useBranches, BRANCHES_KEY } from './useBranches'
export { branchesService, transformBranch } from './branchesService'
export type { Branch, BranchFormData } from './types'

/**
 * Nombre visible de los roles de sistema (fuente unica en el frontend; @lwm/permissions la
 * reexporta). Los roles que
 * crea el administrador se muestran con su propio nombre. Antes vivian dos listas
 * distintas (RolesTable y accessService) y el listado de usuarios mostraba "god".
 */

export const ROLE_LABELS: Record<string, string> = {
  god: 'Superadministrador',
  admin: 'Administrador',
  tech: 'Técnico',
  customer: 'Cliente',
  guest: 'Invitado',
}

export const roleLabel = (name: string): string => ROLE_LABELS[name] ?? name

/**
 * Pagina a la que vuelve el visitante despues de iniciar sesion o registrarse.
 * Solo se aceptan rutas internas: un `redirect` que apunte a otro sitio
 * (`https://...`, `//otro.sitio`) se cambia por la ruta por omision, para que
 * un enlace armado por un tercero no saque al usuario del sitio tras entrar.
 */
export const DEFAULT_AUTH_REDIRECT = '/dashboard'

export function safeRedirect(value: string | null | undefined, fallback: string = DEFAULT_AUTH_REDIRECT): string {
  if (!value) return fallback
  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\') || /[\u0000-\u001f]/.test(path)) return fallback
  return path
}

/** Agrega `?redirect=` a una ruta de acceso cuando el destino no es el de omision. */
export function withRedirect(path: string, redirect: string | null | undefined): string {
  const target = safeRedirect(redirect)
  if (target === DEFAULT_AUTH_REDIRECT) return path
  return `${path}${path.includes('?') ? '&' : '?'}redirect=${encodeURIComponent(target)}`
}

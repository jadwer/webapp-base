/**
 * Avatar del usuario (2026-09-30). El backend guarda "preset:N" para los
 * avatares ilustrados o devuelve la URL de la foto subida.
 *
 * Los ilustrados viven en /images/avatars/avatar-N.svg del public de cada
 * app: diseno puede reemplazar los archivos sin tocar codigo.
 */

export const AVATAR_PRESET_COUNT = 8

export const avatarPresetSrc = (n: number): string => `/images/avatars/avatar-${n}.svg`

/** Presets 1..N en el orden del selector. */
export const AVATAR_PRESETS: number[] = Array.from({ length: AVATAR_PRESET_COUNT }, (_, i) => i + 1)

/** Numero de preset de un valor "preset:N"; null si es foto o vacio. */
export function presetNumber(avatar: string | null | undefined): number | null {
  const m = /^preset:(\d+)$/.exec(avatar ?? '')
  return m ? Number(m[1]) : null
}

/** URL a mostrar para un valor de avatar; null = usar iniciales. */
export function avatarSrc(avatar: string | null | undefined): string | null {
  if (!avatar) return null
  const n = presetNumber(avatar)
  if (n !== null) return n >= 1 && n <= AVATAR_PRESET_COUNT ? avatarPresetSrc(n) : null
  return avatar
}

/** Iniciales para el fallback: "Gabino Ramirez" -> "GR". */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}

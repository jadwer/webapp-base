/**
 * Settings publicos (app-config) leidos en SERVIDOR para SEO (Bloque 2).
 *
 * El hook usePublicSettings es de cliente; los server components (home,
 * layout, fichas) necesitan los mismos valores para JSON-LD y metadata. Se
 * lee /api/v1/app-settings/public con cache de Next (1 h) y se aplana a
 * { 'company.name': 'Labor Wasser de México', ... }. Si la API falla se
 * devuelve un mapa vacio: el JSON-LD se omite, la pagina no se rompe.
 */

type SettingsGroup = Record<string, { value?: unknown } | unknown>

export type PublicSettingsMap = Record<string, unknown>

function backendUrl(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '')
}

export async function getPublicSettings(fetchImpl: typeof fetch = fetch): Promise<PublicSettingsMap> {
  const base = backendUrl()
  if (!base) return {}
  try {
    const res = await fetchImpl(`${base}/api/v1/app-settings/public`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    } as RequestInit)
    if (!res.ok) return {}
    const body = (await res.json()) as { data?: Record<string, SettingsGroup> }
    const flat: PublicSettingsMap = {}
    for (const group of Object.values(body.data ?? {})) {
      if (!group || typeof group !== 'object') continue
      for (const [key, entry] of Object.entries(group)) {
        flat[key] = entry && typeof entry === 'object' && 'value' in (entry as object) ? (entry as { value?: unknown }).value : entry
      }
    }
    return flat
  } catch {
    return {}
  }
}

export function settingString(settings: PublicSettingsMap, key: string): string | undefined {
  const v = settings[key]
  if (typeof v === 'string') {
    const t = v.trim()
    return t ? t : undefined
  }
  if (typeof v === 'number') return String(v)
  return undefined
}

/** Absolutiza rutas relativas de assets (/images/...) contra el host canonico. */
export function absoluteAsset(path: string | undefined, host: string): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//.test(path)) return path
  return `${host.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Imagenes de producto por el optimizador de Next (rendimiento, 2026-09-18).
 *
 * El backend guarda las fotos tal cual se subieron (PNG de 1.1 MB cada una
 * en el home). En vez de migrar a <Image> (obliga a fijar dimensiones y
 * rompe la maquetacion de las tarjetas), se pasa la URL por /_next/image,
 * que redimensiona y convierte a WebP/AVIF en el servidor y cachea en
 * .next/cache/images. Solo aplica a hosts permitidos en remotePatterns
 * (el backend); cualquier otra URL se devuelve intacta.
 */

const ALLOWED_WIDTHS = [256, 384, 640, 750, 828, 1080, 1200] as const
export type OptimizedWidth = (typeof ALLOWED_WIDTHS)[number]

function backendOrigin(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_BACKEND_URL ?? '').origin
  } catch {
    return ''
  }
}

export function optimizedImage(url: string | null | undefined, width: OptimizedWidth = 640, quality = 75): string | null {
  if (!url) return null
  const origin = backendOrigin()
  if (!origin || !url.startsWith(`${origin}/storage/`)) return url
  // Next solo acepta anchos de su lista (deviceSizes + imageSizes); cualquier
  // otro devuelve 400, asi que se normaliza al permitido mas cercano.
  const w = ALLOWED_WIDTHS.includes(width) ? width : ALLOWED_WIDTHS.reduce((a, b) => (Math.abs(b - width) < Math.abs(a - width) ? b : a))
  return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=${quality}`
}

/** srcset con dos anchos para tarjetas (movil / escritorio). */
export function optimizedSrcSet(url: string | null | undefined, widths: OptimizedWidth[] = [384, 640]): string | undefined {
  if (!url) return undefined
  const origin = backendOrigin()
  if (!origin || !url.startsWith(`${origin}/storage/`)) return undefined
  return widths.map((w) => `${optimizedImage(url, w)} ${w}w`).join(', ')
}

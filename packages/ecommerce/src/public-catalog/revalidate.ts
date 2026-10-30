/**
 * REVALIDACION BAJO DEMANDA DE LA TIENDA (P1 granel, decision D5, 2026-10-10)
 *
 * La ficha /productos/[slug] es ISR de 1 h. Cuando el backend cambia un
 * producto o su galeria llama a POST /api/revalidate del sitio (route handler
 * de cada app, que solo reexporta createRevalidateHandler) con
 * `Authorization: Bearer <REVALIDATE_TOKEN>` y {paths, tags}.
 *
 * - El token es variable de entorno del SERVIDOR (REVALIDATE_TOKEN, sin
 *   NEXT_PUBLIC_): nunca llega al navegador. Sin token configurado responde
 *   503 y no revalida nada.
 * - Solo acepta rutas de producto y tags del catalogo publico (lista blanca),
 *   para que un token filtrado no permita purgar la cache de todo el sitio.
 *
 * Sin imports de next: las apps inyectan revalidatePath/revalidateTag de
 * 'next/cache', y los tests inyectan dobles.
 */

export const STOREFRONT_TAGS = {
  /** Paginas del listado del catalogo. */
  catalog: 'public-catalog',
  /** Todas las fichas (cambio masivo). */
  products: 'public-products',
  product: (id: string | number) => `public-product:${id}`,
  productSlug: (slug: string) => `public-product-slug:${slug}`,
} as const

const MAX_ENTRIES = 200
const TAG_RE = /^public-(catalog|products|product:\d{1,20}|product-slug:[a-z0-9-]{1,191})$/
const PATH_RE = /^\/productos(\/[a-z0-9-]{1,191})?$/

export interface RevalidateRequestBody {
  paths?: string[]
  tags?: string[]
}

export interface RevalidateHandlerDeps {
  revalidatePath: (path: string) => void
  revalidateTag: (tag: string) => void
  /** Por defecto process.env.REVALIDATE_TOKEN. */
  getToken?: () => string | undefined
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

/** Comparacion en tiempo constante (para cadenas de igual longitud). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function readList(value: unknown, re: RegExp, name: string): { ok: string[]; error?: string } {
  if (value === undefined || value === null) return { ok: [] }
  if (!Array.isArray(value)) return { ok: [], error: `${name} debe ser una lista` }
  if (value.length > MAX_ENTRIES) return { ok: [], error: `${name}: máximo ${MAX_ENTRIES} elementos` }
  const invalid = value.filter((v) => typeof v !== 'string' || !re.test(v))
  if (invalid.length > 0) {
    return { ok: [], error: `${name} no permitidos: ${invalid.slice(0, 5).map(String).join(', ')}` }
  }
  return { ok: Array.from(new Set(value as string[])) }
}

export function createRevalidateHandler(deps: RevalidateHandlerDeps) {
  return async function POST(request: Request): Promise<Response> {
    const expected = (deps.getToken ? deps.getToken() : process.env.REVALIDATE_TOKEN)?.trim() ?? ''
    if (!expected) {
      return json({ revalidated: false, error: 'Revalidación desactivada: falta REVALIDATE_TOKEN en el servidor' }, 503)
    }

    const header = request.headers.get('authorization') ?? ''
    const given = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : ''
    if (!given || !safeEqual(given, expected)) {
      return json({ revalidated: false, error: 'Token invalido' }, 401)
    }

    let body: RevalidateRequestBody
    try {
      body = (await request.json()) as RevalidateRequestBody
    } catch {
      return json({ revalidated: false, error: 'Cuerpo JSON invalido' }, 400)
    }
    if (!body || typeof body !== 'object') {
      return json({ revalidated: false, error: 'Cuerpo JSON invalido' }, 400)
    }

    const paths = readList(body.paths, PATH_RE, 'paths')
    const tags = readList(body.tags, TAG_RE, 'tags')
    const error = paths.error ?? tags.error
    if (error) return json({ revalidated: false, error }, 400)
    if (paths.ok.length === 0 && tags.ok.length === 0) {
      return json({ revalidated: false, error: 'Sin paths ni tags' }, 400)
    }

    for (const tag of tags.ok) deps.revalidateTag(tag)
    for (const path of paths.ok) deps.revalidatePath(path)

    return json({ revalidated: true, paths: paths.ok, tags: tags.ok, now: Date.now() }, 200)
  }
}

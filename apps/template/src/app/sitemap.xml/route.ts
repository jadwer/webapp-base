import { listSitemapIds, normalizeHost, sitemapIndexXml, SITEMAP_REVALIDATE_SECONDS } from '@/lib/seo/sitemap'

// Indice de sitemaps. Next genera cada lote en /sitemap/<id>.xml (via
// generateSitemaps en app/sitemap.ts) pero no genera el indice: lo hacemos aqui.
// Next exige un literal en revalidate (no acepta constantes importadas).
export const revalidate = 86400

export async function GET() {
  const host = normalizeHost(process.env.NEXT_PUBLIC_CANONICAL_HOST)
  const backendUrl = normalizeHost(process.env.NEXT_PUBLIC_BACKEND_URL, 'http://localhost:8000')
  const ids = await listSitemapIds(backendUrl, fetch)

  return new Response(sitemapIndexXml(host, ids), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=0, s-maxage=${SITEMAP_REVALIDATE_SECONDS}`,
    },
  })
}

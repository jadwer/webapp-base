import type { MetadataRoute } from 'next'
import { buildSitemap, listSitemapIds, normalizeHost } from '@/lib/seo/sitemap'
import { SITEMAP_STATIC_PATHS } from './sitemap.config'

// ISR: se genera en build y se regenera como maximo una vez al dia.
// Next exige un literal aqui (no acepta constantes importadas).
export const revalidate = 86400

const source = () => ({
  host: normalizeHost(process.env.NEXT_PUBLIC_CANONICAL_HOST),
  backendUrl: normalizeHost(process.env.NEXT_PUBLIC_BACKEND_URL, 'http://localhost:8000'),
  staticPaths: SITEMAP_STATIC_PATHS,
})

export async function generateSitemaps() {
  return listSitemapIds(source().backendUrl, fetch)
}

export default async function sitemap({ id }: { id: number | string }): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(id, source(), fetch)
}

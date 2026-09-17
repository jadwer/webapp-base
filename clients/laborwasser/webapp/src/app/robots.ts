import type { MetadataRoute } from 'next'
import { buildRobots } from '@/lib/seo/robots'

export default function robots(): MetadataRoute.Robots {
  return buildRobots({
    NEXT_PUBLIC_CANONICAL_HOST: process.env.NEXT_PUBLIC_CANONICAL_HOST,
    NEXT_PUBLIC_SEO_NOINDEX: process.env.NEXT_PUBLIC_SEO_NOINDEX,
    NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
  })
}

import { Metadata } from 'next'
import HomeClient from './HomeClient'

/**
 * Generic metadata for the template homepage.
 *
 * Tenants override this in their own `clients/<name>/webapp/src/app/page.tsx`
 * with their company name, tagline, OG image, etc. Or wire `generateMetadata`
 * to read from AppSetting at request time.
 */
export const metadata: Metadata = {
  title: 'WebApp Base Template',
  description: '',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <HomeClient
      showFullCatalog={false}
      enableProductModal={true}
    />
  )
}

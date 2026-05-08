import type { Metadata } from 'next'
import Script from 'next/script'
import { NavigationProgress } from '@lwm/ui'
import '@/styles/main.scss'

export const metadata: Metadata = {
  title: {
    default: 'AlphaLab Chemicals',
    template: '%s | AlphaLab Chemicals',
  },
  description:
    'Pure Solutions. Powerful Results. Reactivos químicos, materias primas y soluciones de laboratorio para industria, investigación y educación.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_CANONICAL_HOST || 'https://alphalabchem.com.mx'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AlphaLab Chemicals',
    description: 'Pure Solutions. Powerful Results.',
    url: 'https://alphalabchem.com.mx',
    siteName: 'AlphaLab Chemicals',
    locale: 'es_MX',
    type: 'website',
  },
  icons: {
    icon: '/images/brand/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        {/* Bootstrap Icons via CDN (icon fonts only, the rest of Bootstrap
            is compiled into our own SASS chain via main.scss). */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        />
      </head>
      <body>
        <NavigationProgress />
        {children}
        {/* Bootstrap JS for interactive components (modals, offcanvas...). */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import Script from 'next/script'
import { NavigationProgress } from '@lwm/ui'
import '@/styles/main.scss'

export const metadata: Metadata = {
  title: {
    default: 'Labor Wasser de Mexico',
    template: '%s | Labor Wasser de Mexico',
  },
  description:
    'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia. Productos certificados, envío rápido y asesoría especializada.',
  keywords:
    'laboratorio, reactivos, material de laboratorio, equipos científicos, México, distribuidora, productos químicos',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_CANONICAL_HOST || 'https://laborwasserdemexico.com'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Labor Wasser de Mexico',
    description:
      'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia.',
    url: 'https://laborwasserdemexico.com',
    siteName: 'Labor Wasser de Mexico',
    locale: 'es_MX',
    type: 'website',
  },
  // Favicon: Next 15 sirve automaticamente src/app/icon.png (cuadrado 256,
  // recortado y centrado del logo). El favicon anterior era el logo
  // RECTANGULAR 2250x1319 en WebP: el navegador lo aplastaba y varios ni
  // aceptan WebP como icono, por eso se veia mal.
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

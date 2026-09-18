import type { Metadata } from 'next'
import Script from 'next/script'
import { Anek_Bangla, Poppins } from 'next/font/google'
import { NavigationProgress } from '@lwm/ui'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/styles/main.scss'

// Fuentes autoalojadas por next/font (rendimiento, 2026-09-18): antes venian
// por @import de Google Fonts dentro del CSS (bloqueo de render en cadena,
// 18 variantes de Poppins). Solo los pesos que usa el diseno.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
})
const anekBangla = Anek_Bangla({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-anek',
})

// Solo IDs de GA4 con forma valida; cualquier otra cosa se ignora (nunca se
// interpola texto arbitrario dentro del script).
const GA_ID = /^G-[A-Z0-9]{4,}$/.test(process.env.NEXT_PUBLIC_GA_ID ?? '') ? process.env.NEXT_PUBLIC_GA_ID : undefined
const BACKEND_ORIGIN = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_BACKEND_URL ?? '').origin
  } catch {
    return ''
  }
})()

export const metadata: Metadata = {
  title: {
    default: 'Labor Wasser de México',
    template: '%s | Labor Wasser de México',
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
    title: 'Labor Wasser de México',
    description:
      'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia.',
    url: 'https://laborwasserdemexico.com',
    siteName: 'Labor Wasser de México',
    locale: 'es_MX',
    type: 'website',
    // Imagen por defecto para cualquier pagina sin og:image propia (SEO Bloque 2)
    images: [{ url: '/images/laborwasser/labor-wasser-mexico-hero-1.webp', alt: 'Labor Wasser de México' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/laborwasser/labor-wasser-mexico-hero-1.webp'],
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
    <html lang="es" className={`${poppins.variable} ${anekBangla.variable}`}>
      <head>
        {/* Bootstrap Icons se importan como CSS local (ver import arriba):
            el CDN bloqueaba el render ~950 ms en movil (Lighthouse 2026-09-18).
            Preconexion al backend: de ahi vienen las imagenes de producto. */}
        {BACKEND_ORIGIN && <link rel="preconnect" href={BACKEND_ORIGIN} crossOrigin="anonymous" />}
      </head>
      <body>
        <NavigationProgress />
        {children}
        {/* Bootstrap JS for interactive components (modals, offcanvas...). */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
        {/* Google Analytics 4 (gtag). El sitio legado (rama master) llevaba
            G-BG4P3QWZW3 hardcodeado y se perdio en el cutover de julio 2026;
            desde SEO Bloque 1 se inyecta por NEXT_PUBLIC_GA_ID (solo en el
            build de prod; dev y demo no lo definen y no envian hits). */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
            <Script id="google-analytics" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}

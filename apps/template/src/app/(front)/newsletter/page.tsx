/**
 * Newsletter Page
 *
 * Public page for newsletter subscription.
 * Route: /newsletter
 */

import { Metadata } from 'next'
import { NewsletterPageClient } from './NewsletterPageClient'

export const metadata: Metadata = {
  title: 'Newsletter | Labor Wasser de Mexico',
  description: 'Suscribete a nuestro newsletter y recibe las ultimas noticias, ofertas y novedades en reactivos y material de laboratorio.',
  keywords: 'newsletter, suscripcion, ofertas, laboratorio, reactivos',
}

export default function NewsletterPage() {
  return <NewsletterPageClient />
}

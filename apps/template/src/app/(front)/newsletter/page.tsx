/**
 * Newsletter Page
 *
 * Public page for newsletter subscription.
 * Route: /newsletter
 */

import { Metadata } from 'next'
import { NewsletterPageClient } from './NewsletterPageClient'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Suscribete a nuestro newsletter y recibe las ultimas noticias, ofertas y novedades.',
  keywords: 'newsletter, suscripcion, ofertas',
}

export default function NewsletterPage() {
  return <NewsletterPageClient />
}

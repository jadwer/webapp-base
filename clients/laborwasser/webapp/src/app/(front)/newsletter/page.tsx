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
  description: 'Suscríbete a nuestro newsletter y recibe las últimas noticias, ofertas y novedades.',
  keywords: 'newsletter, suscripción, ofertas',
}

export default function NewsletterPage() {
  return <NewsletterPageClient />
}

import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { JsonLd, faqPageJsonLd, type FaqInput } from '@/lib/seo/jsonLd'
import { getPublicSettings } from '@/lib/seo/publicSettings'
import { faqDefaults } from '@/modules/landing/data/faqDefaults'

const DESCRIPTION =
  'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia. Productos certificados, envío rápido y asesoría especializada.'
const OG_IMAGE = '/images/laborwasser/labor-wasser-mexico-hero-1.webp'

export const metadata: Metadata = {
  // absolute: el layout agrega " | Labor Wasser de México" y el home ya
  // lleva la marca; sin esto el title salia duplicado y con ~90 caracteres.
  title: { absolute: 'Labor Wasser de México: reactivos y material de laboratorio' },
  description: DESCRIPTION,
  authors: [{ name: 'Labor Wasser de México' }],
  creator: 'Labor Wasser de México',
  publisher: 'Labor Wasser de México',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Labor Wasser de México: reactivos y material de laboratorio',
    description: 'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia.',
    type: 'website',
    locale: 'es_MX',
    siteName: 'Labor Wasser de México',
    url: '/',
    images: [{ url: OG_IMAGE, alt: 'Labor Wasser de México' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Labor Wasser de México: reactivos y material de laboratorio',
    description: 'Distribuidora especializada en reactivos y material de laboratorio con más de 20 años de experiencia.',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: '/',
  },
}

function parseFaq(raw: unknown): FaqInput[] | null {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(value)) return null
    const items = value
      .filter((i) => i && typeof i.question === 'string' && typeof i.answer === 'string')
      .map((i) => ({ question: i.question.trim(), answer: i.answer.trim() }))
      .filter((i) => i.question && i.answer)
    return items.length > 0 ? items : null
  } catch {
    return null
  }
}

export default async function HomePage() {
  // Mismas preguntas que muestra PreguntasFrecuentes (landing.faq o defaults):
  // el JSON-LD FAQPage debe coincidir con lo visible.
  const settings = await getPublicSettings()
  const faq = parseFaq(settings['landing.faq']) ?? faqDefaults

  return (
    <>
      <JsonLd data={faqPageJsonLd(faq)} />
      <HomeClient />
    </>
  )
}

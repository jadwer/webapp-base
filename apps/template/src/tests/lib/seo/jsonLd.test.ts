import { describe, it, expect } from 'vitest'
import {
  organizationJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
  productJsonLd,
  serializeJsonLd,
} from '@/lib/seo/jsonLd'

describe('organizationJsonLd', () => {
  it('normaliza telefonos mexicanos, arma direccion y omite vacios', () => {
    const org = organizationJsonLd({
      name: 'Labor Wasser de México',
      url: 'https://laborwasserdemexico.com',
      logo: 'https://laborwasserdemexico.com/logo.webp',
      phones: ['55 7575 1661', '', null, '+52 1 56 1040 0441'],
      email: 'ventas@x.com',
      address: { city: 'Ciudad de México', region: 'CDMX', postalCode: '' },
      sameAs: ['#', 'https://facebook.com/x', null],
    })
    expect(org['@type']).toBe('Organization')
    expect(org.telephone).toBe('+525575751661')
    expect((org.contactPoint as unknown[]).length).toBe(2)
    expect(org.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Ciudad de México', addressRegion: 'CDMX', addressCountry: 'MX' })
    expect(org.sameAs).toEqual(['https://facebook.com/x'])
    expect(org).not.toHaveProperty('postalCode')
  })

  it('sin telefonos ni direccion queda minimo y valido', () => {
    const org = organizationJsonLd({ name: 'X', url: 'https://x.com' })
    expect(org).toEqual({ '@context': 'https://schema.org', '@type': 'Organization', name: 'X', url: 'https://x.com' })
  })
})

describe('faqPageJsonLd', () => {
  it('genera Question/Answer y descarta vacios; null sin items', () => {
    const faq = faqPageJsonLd([
      { question: '¿Envían?', answer: 'Sí.' },
      { question: '  ', answer: 'x' },
    ])
    expect(faq?.['@type']).toBe('FAQPage')
    expect((faq?.mainEntity as unknown[]).length).toBe(1)
    expect(faqPageJsonLd([])).toBeNull()
  })
})

describe('breadcrumbJsonLd', () => {
  it('numera posiciones desde 1', () => {
    const bc = breadcrumbJsonLd([
      { name: 'Inicio', url: 'https://x.com/' },
      { name: 'Productos', url: 'https://x.com/productos' },
    ])
    expect((bc?.itemListElement as Array<{ position: number }>).map((i) => i.position)).toEqual([1, 2])
    expect(breadcrumbJsonLd([])).toBeNull()
  })
})

describe('productJsonLd', () => {
  it('con precio > 0 arma Offer en MXN; sin precio no inventa oferta ni disponibilidad', () => {
    const p = productJsonLd({ name: 'Jumper', url: 'https://x.com/productos/jumper', sku: 'HA-1', brand: 'Hach', price: 435.5, currency: 'MXN', image: 'https://x.com/i.webp' })
    expect(p.brand).toEqual({ '@type': 'Brand', name: 'Hach' })
    expect(p.offers).toEqual({ '@type': 'Offer', url: 'https://x.com/productos/jumper', price: '435.50', priceCurrency: 'MXN', itemCondition: 'https://schema.org/NewCondition' })
    expect(JSON.stringify(p)).not.toContain('availability')

    const q = productJsonLd({ name: 'Cotizar', url: 'https://x.com/p', price: 0 })
    expect(q).not.toHaveProperty('offers')
    expect(q).not.toHaveProperty('brand')
  })
})

describe('serializeJsonLd', () => {
  it('escapa < para que un dato no cierre el script', () => {
    const out = serializeJsonLd({ '@type': 'Thing', name: '</script><script>alert(1)</script>' })
    expect(out).not.toContain('</script>')
    expect(out).toContain('\\u003c/script>')
  })
})

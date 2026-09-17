import { describe, it, expect } from 'vitest'
import { buildRobots, isNoIndexEnv, ROBOTS_DISALLOW } from '@/lib/seo/robots'

describe('robots', () => {
  it('produccion: permite todo salvo las rutas privadas y apunta al sitemap del host canonico', () => {
    const robots = buildRobots({ NEXT_PUBLIC_CANONICAL_HOST: 'https://laborwasserdemexico.com/' })
    expect(robots.rules).toEqual({ userAgent: '*', allow: '/', disallow: ROBOTS_DISALLOW })
    expect(robots.sitemap).toBe('https://laborwasserdemexico.com/sitemap.xml')
    expect(robots.host).toBe('https://laborwasserdemexico.com')
  })

  it('bloquea dashboard, auth, carrito, checkout, cotizacion y confirmacion de pedido', () => {
    for (const path of ['/dashboard', '/auth', '/cart', '/checkout', '/cotizacion', '/order-confirmation']) {
      expect(ROBOTS_DISALLOW).toContain(path)
    }
    expect(ROBOTS_DISALLOW).not.toContain('/productos')
  })

  it('dev (NEXT_PUBLIC_SEO_NOINDEX) y demo (NEXT_PUBLIC_DEMO_MODE) bloquean todo y no anuncian sitemap', () => {
    expect(isNoIndexEnv({ NEXT_PUBLIC_SEO_NOINDEX: 'true' })).toBe(true)
    expect(isNoIndexEnv({ NEXT_PUBLIC_DEMO_MODE: 'true' })).toBe(true)
    expect(isNoIndexEnv({ NEXT_PUBLIC_SEO_NOINDEX: 'false', NEXT_PUBLIC_DEMO_MODE: 'false' })).toBe(false)
    expect(isNoIndexEnv({})).toBe(false)

    const robots = buildRobots({ NEXT_PUBLIC_SEO_NOINDEX: 'true', NEXT_PUBLIC_CANONICAL_HOST: 'https://dev.test' })
    expect(robots.rules).toEqual({ userAgent: '*', disallow: '/' })
    expect(robots.sitemap).toBeUndefined()
  })
})

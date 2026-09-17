/**
 * robots.txt (SEO Bloque 0, 2026-09-16). Logica pura; app/robots.ts la cablea.
 *
 * Entornos que NO deben indexarse (dev, demo marca blanca): se bloquea todo.
 * Se activa con NEXT_PUBLIC_SEO_NOINDEX=true o con NEXT_PUBLIC_DEMO_MODE=true.
 */

import { absoluteUrl, normalizeHost } from './sitemap'

export const ROBOTS_DISALLOW = [
  '/dashboard',
  '/auth',
  '/cart',
  '/checkout',
  '/cotizacion',
  '/order-confirmation',
  '/api/',
  '/test-icons',
]

export interface RobotsEnv {
  NEXT_PUBLIC_CANONICAL_HOST?: string
  NEXT_PUBLIC_SEO_NOINDEX?: string
  NEXT_PUBLIC_DEMO_MODE?: string
}

export interface RobotsRule {
  userAgent: string
  allow?: string
  disallow: string | string[]
}

export interface RobotsResult {
  rules: RobotsRule
  sitemap?: string
  host?: string
}

export function isNoIndexEnv(env: RobotsEnv): boolean {
  return env.NEXT_PUBLIC_SEO_NOINDEX === 'true' || env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

export function buildRobots(env: RobotsEnv): RobotsResult {
  if (isNoIndexEnv(env)) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  const host = normalizeHost(env.NEXT_PUBLIC_CANONICAL_HOST)
  return {
    rules: { userAgent: '*', allow: '/', disallow: ROBOTS_DISALLOW },
    sitemap: absoluteUrl(host, '/sitemap.xml'),
    host,
  }
}

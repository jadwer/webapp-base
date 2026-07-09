import type { NextConfig } from 'next'
import path from 'path'

/**
 * Labor Wasser de Mexico webapp — Next.js config.
 *
 * Mirrors apps/template/next.config.ts. The transpilePackages list MUST
 * stay in sync with the template's; otherwise CSS Modules from the
 * @lwm/* packages render unstyled at build time. The sassOptions
 * includePath points at @lwm/primitives' tokens (moved there from
 * @lwm/ui in 2026-05-12 — deuda B5) so any *.module.scss in the
 * workspace can resolve `@use 'tokens/_colors.scss' as *` without a
 * relative chain.
 */

function apiHostPattern() {
  const host = process.env.NEXT_PUBLIC_API_HOST || process.env.NEXT_PUBLIC_BACKEND_URL
  if (!host) return null
  try {
    const url = new URL(host)
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: '/storage/**',
    }
  } catch {
    return null
  }
}

const remotePatterns: NonNullable<NonNullable<NextConfig['images']>['remotePatterns']> = [
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '8000',
    pathname: '/**',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '8000',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'erpapi.laborwasserdemexico.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'apidev.laborwasserdemexico.com',
    pathname: '/**',
  },
]

const envPattern = apiHostPattern()
if (envPattern) remotePatterns.push(envPattern)

const nextConfig: NextConfig = {
  // Build self-contained output for cPanel deploy. Phusion Passenger spawns
  // node on a single dir; `standalone` bundles required node_modules
  // including @lwm/* workspace deps resolved inline. `outputFileTracingRoot`
  // points to the monorepo root so Next traces the actual symlinked
  // packages instead of stopping at the cwd.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..', '..', '..'),
  transpilePackages: [
    '@lwm/primitives',
    '@lwm/ui',
    '@lwm/auth',
    '@lwm/app-config',
    '@lwm/products',
    '@lwm/contacts',
    '@lwm/sales',
    '@lwm/ecommerce',
    '@lwm/page-builder',
    '@lwm/mailer-manager',
    '@lwm/permissions',
  ],
  sassOptions: {
    includePaths: [
      // packages/primitives/src/styles is 4 levels up from
      // clients/laborwasser/webapp/. Tokens moved here from @lwm/ui in
      // 2026-05-12 to break the @lwm/auth ↔ @lwm/ui cycle (deuda B5).
      path.join(__dirname, '..', '..', '..', 'packages', 'primitives', 'src', 'styles'),
    ],
  },
  images: { remotePatterns },
  async redirects() {
    return [
      // www -> apex canonical.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.laborwasserdemexico.com' }],
        destination: 'https://laborwasserdemexico.com/:path*',
        permanent: true,
      },
      // Legacy routes indexed by Google under the old monolith. Not ported
      // to the new tenant — send traffic to the current catalog instead.
      {
        source: '/laborwasser-catalogo',
        destination: '/productos',
        permanent: true,
      },
      {
        source: '/laborwasser-demo/:path*',
        destination: '/productos',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

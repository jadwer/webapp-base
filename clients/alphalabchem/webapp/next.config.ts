import type { NextConfig } from 'next'
import path from 'path'

/**
 * AlphaLab Chemicals webapp — Next.js config.
 *
 * Mirrors apps/template/next.config.ts. The transpilePackages list MUST
 * stay in sync with the template's; otherwise CSS Modules from the
 * @lwm/* packages render unstyled at build time. The sassOptions
 * includePath points at @lwm/ui's tokens so any *.module.scss in the
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
]

const envPattern = apiHostPattern()
if (envPattern) remotePatterns.push(envPattern)

const nextConfig: NextConfig = {
  transpilePackages: [
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
      // packages/ui/src/styles is 4 levels up from
      // clients/alphalabchem/webapp/.
      path.join(__dirname, '..', '..', '..', 'packages', 'ui', 'src', 'styles'),
    ],
  },
  images: { remotePatterns },
  // www -> non-www redirect for production. Tenants typically want this.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.alphalabchem.com.mx' }],
        destination: 'https://alphalabchem.com.mx/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig

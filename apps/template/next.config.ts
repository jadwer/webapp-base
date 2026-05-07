import type { NextConfig } from "next";

/**
 * Next.js config for the webapp-base TEMPLATE (master alive).
 *
 * Tenants override this in their own clients/<name>/webapp/next.config.ts:
 *   - www -> non-www redirects
 *   - production-specific image hostnames
 *   - any tenant-specific rewrites/redirects
 *
 * The template only declares local-dev image patterns. Production hostnames
 * are derived from NEXT_PUBLIC_BACKEND_URL (already used by every API call)
 * so the same code works for any tenant without a code edit. Tenants may
 * override with NEXT_PUBLIC_API_HOST if their image host differs from their
 * API host.
 */

function apiHostPattern() {
  const host = process.env.NEXT_PUBLIC_API_HOST || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!host) return null;
  try {
    const url = new URL(host);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: '/storage/**',
    };
  } catch {
    return null;
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
];

const envPattern = apiHostPattern();
if (envPattern) remotePatterns.push(envPattern);

const nextConfig: NextConfig = {
  // Workspace packages ship TS+SCSS source. transpilePackages tells Next to
  // run them through its own SWC + CSS-modules pipeline so component styles
  // resolve to real class hashes (instead of the empty stubs tsup emits when
  // SCSS is treated as a side-effect-free import).
  transpilePackages: ['@lwm/ui'],
  images: { remotePatterns },
};

export default nextConfig;

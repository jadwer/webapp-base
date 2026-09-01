import type { NextConfig } from "next";
import path from "path";

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
  // Self-contained build for cPanel/Passenger deploys (marca blanca demo).
  // Same pattern as clients/*/webapp: standalone bundles the needed
  // node_modules with @lwm/* resolved inline, and outputFileTracingRoot
  // points at the monorepo root so tracing follows the workspace symlinks.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
  // Workspace packages ship TS+SCSS source. transpilePackages tells Next to
  // run them through its own SWC + CSS-modules pipeline so component styles
  // resolve to real class hashes (instead of the empty stubs tsup emits when
  // SCSS is treated as a side-effect-free import).
  //
  // Every @lwm/* package that ships .module.scss imports must be listed here.
  // Tenants in clients/<name>/webapp/ MUST mirror this list in their own
  // next.config.ts; otherwise CSS Modules from these packages render unstyled.
  transpilePackages: ['@lwm/primitives', '@lwm/ui', '@lwm/auth', '@lwm/app-config', '@lwm/billing', '@lwm/products', '@lwm/contacts', '@lwm/sales', '@lwm/ecommerce', '@lwm/page-builder', '@lwm/mailer-manager', '@lwm/permissions'],
  // Single source of truth for SCSS design tokens lives in @lwm/primitives
  // (moved there in 2026-05-12 to break the @lwm/auth ↔ @lwm/ui cycle —
  // deuda B5). Every *.module.scss across the workspace can
  // `@use 'tokens/_colors.scss' as *` without a relative `../../../` chain.
  sassOptions: {
    includePaths: [
      path.join(__dirname, "..", "..", "packages", "primitives", "src", "styles"),
    ],
  },
  images: { remotePatterns },
};

export default nextConfig;

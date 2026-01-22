import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // devIndicators: false
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apidev.laborwasserdemexico.com',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'api.laborwasserdemexico.com',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;

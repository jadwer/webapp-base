import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // devIndicators: false
  images: {
    remotePatterns: [
      // Local development
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
      // Development server
      {
        protocol: 'https',
        hostname: 'apidev.laborwasserdemexico.com',
        pathname: '/storage/**',
      },
      // Production server
      {
        protocol: 'https',
        hostname: 'api.laborwasserdemexico.com',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;

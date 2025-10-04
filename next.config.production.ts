import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚠️ REMOVED: Server-side env vars that were exposed to client
  // These should only be accessed server-side via process.env
  
  images: {
    domains: ["image.tmdb.org", "ui-avatars.com"],
    dangerouslyAllowSVG: true,
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
    ];
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@chakra-ui/react'],
  },
  
  // Redirects for better SEO and canonical consistency
  async redirects() {
    return [
      // Redirect www to non-www for canonical consistency
      {
        source: '/(.*)',
        has: [
          {
            type: 'host',
            value: 'www.screenpick.fun',
          },
        ],
        destination: 'https://screenpick.fun/:path*',
        permanent: true,
      },
      // Redirect /api to docs
      {
        source: '/api',
        destination: '/docs',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import dotenv from "dotenv";

dotenv.config();

const nextConfig: NextConfig = {
  env: {
    GAPI: process.env.GAPI,
    TMDB: process.env.TMDB,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    API_KEY: process.env.API_KEY,
    BASE_URL: process.env.BASE_URL,
  },
  images: {
    domains: ["image.tmdb.org", "ui-avatars.com"],
    dangerouslyAllowSVG: true,
  },
  // Handle redirects for consistent canonical URLs
  async redirects() {
    return [
      // Redirect www to non-www
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
    ];
  },
};

export default nextConfig;

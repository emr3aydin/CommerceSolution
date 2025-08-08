/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    logging: {
      level: 'verbose',
    },
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7057',
  },
};

module.exports = nextConfig;

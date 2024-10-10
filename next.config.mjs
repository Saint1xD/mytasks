/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000/api',
    DATABASE_URL: process.env.DATABASE_URL,
  },
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;

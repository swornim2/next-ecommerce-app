/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
    domains: ['bestbuystore.com.np'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  basePath: '',
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://bestbuystore.com.np',
  },
}

module.exports = nextConfig

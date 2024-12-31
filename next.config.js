/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      }
    ],
  },
}
// next.config.js
module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};


module.exports = nextConfig

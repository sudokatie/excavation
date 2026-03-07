/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/games/excavation',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

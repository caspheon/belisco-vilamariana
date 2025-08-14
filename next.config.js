/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações otimizadas para Vercel
  output: 'standalone',
  experimental: {
    // Removendo appDir pois já é padrão no Next.js 14
  },
}

module.exports = nextConfig

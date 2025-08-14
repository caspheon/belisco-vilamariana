/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações otimizadas para Vercel
  output: 'standalone',
  experimental: {
    // Removendo appDir pois já é padrão no Next.js 14
  },
  // Desabilitar SSG completamente
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Forçar renderização dinâmica
  staticPageGenerationTimeout: 0,
}

module.exports = nextConfig

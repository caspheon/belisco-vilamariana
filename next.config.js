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
  // Desabilitar coleta de dados estáticos
  generateStaticParams: false,
  // Forçar todas as rotas a serem dinâmicas
  dynamicParams: true,
  // Desabilitar otimizações estáticas
  optimizePackageImports: false,
  // Configuração para evitar execução de API routes durante build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Desabilitar execução de módulos durante build
      config.externals = config.externals || []
      config.externals.push({
        '@neondatabase/serverless': 'commonjs @neondatabase/serverless'
      })
    }
    return config
  }
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações otimizadas para Vercel
  output: 'standalone',
  experimental: {
    // Removendo appDir pois já é padrão no Next.js 14
    // Desabilitar completamente a coleta de dados estáticos
    workerThreads: false,
    cpus: 1
  },
  // Desabilitar SSG completamente
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Forçar renderização dinâmica
  staticPageGenerationTimeout: 0,
  // Configuração para evitar execução de API routes durante build
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      // Em produção, desabilitar completamente módulos de banco
      config.externals = config.externals || []
      config.externals.push({
        '@neondatabase/serverless': 'commonjs @neondatabase/serverless'
      })
      
      // Desabilitar otimizações que podem executar código
      config.optimization = {
        ...config.optimization,
        minimize: false,
        splitChunks: false
      }
    }
    return config
  },
  // Configuração adicional para evitar SSG
  images: {
    unoptimized: true
  },
  // Forçar todas as páginas a serem dinâmicas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

import { neon } from '@neondatabase/serverless'

// Configuração do banco Neon - só executa em runtime
let sql: any = null

export function getDatabase() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não está definida')
    }
    sql = neon(databaseUrl)
  }
  return sql
}

// Função para verificar se o banco está disponível
export function isDatabaseAvailable() {
  return !!process.env.DATABASE_URL
}

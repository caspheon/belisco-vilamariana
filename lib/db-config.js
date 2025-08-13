const { neon } = require('@neondatabase/serverless');

// Verificar se a variável de ambiente está definida
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida nas variáveis de ambiente');
}

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL);

// Função para testar a conexão
async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Conexão com banco de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  }
}

module.exports = { sql, testConnection };

import { neon } from '@neondatabase/serverless'

// Configuração do banco Neon - só executa em runtime
let sql = null

function getDatabase() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não está definida')
    }
    sql = neon(databaseUrl)
  }
  return sql
}

// GET - Buscar ranking dos jogadores
export default async function handler(req, res) {
  try {
    // Verificar se o banco está disponível
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL não configurada')
      return res.status(500).json({ 
        error: 'Configuração de banco de dados não encontrada. Verifique se a variável DATABASE_URL está definida.' 
      })
    }

    if (req.method === 'GET') {
      const sql = getDatabase()
      const ranking = await sql`
        SELECT 
          id,
          name,
          matches,
          wins,
          losses,
          rating,
          created_at,
          CASE 
            WHEN matches = 0 THEN 0
            ELSE ROUND((wins::DECIMAL / matches::DECIMAL) * 100, 1)
          END as win_rate
        FROM players 
        ORDER BY rating DESC, wins DESC, name ASC
      `
      
      return res.status(200).json(ranking)
    }
    
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro na API de ranking:', error)
    
    // Tratamento específico para erros de conexão
    if (error.message && error.message.includes('DATABASE_URL')) {
      return res.status(500).json({ 
        error: 'Erro de configuração do banco de dados. Verifique se DATABASE_URL está definida corretamente.' 
      })
    }
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor. Verifique a conexão com o banco de dados.' 
    })
  }
}

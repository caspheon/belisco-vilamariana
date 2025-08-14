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
  // Verificar se o banco está disponível
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL não configurada' })
  }

  try {
    if (req.method === 'GET') {
      const sql = getDatabase()
      const ranking = await sql`
        SELECT 
          p.id,
          p.name,
          p.created_at,
          COALESCE(stats.total_matches, 0) as total_matches,
          COALESCE(stats.total_wins, 0) as total_wins,
          COALESCE(stats.total_losses, 0) as total_losses,
          CASE 
            WHEN COALESCE(stats.total_matches, 0) = 0 THEN 0
            ELSE ROUND((COALESCE(stats.total_wins, 0)::DECIMAL / COALESCE(stats.total_matches, 1)::DECIMAL) * 100, 1)
          END as win_rate
        FROM players p
        LEFT JOIN LATERAL (
          SELECT * FROM get_player_stats(p.id)
        ) stats ON true
        ORDER BY 
          COALESCE(stats.total_wins, 0) DESC,
          COALESCE(stats.total_matches, 0) DESC,
          p.name ASC
      `
      
      return res.status(200).json(ranking)
    }
    
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro na API:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

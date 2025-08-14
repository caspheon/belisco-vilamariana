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

// GET - Listar todas as partidas
export default async function handler(req, res) {
  // Verificar se o banco está disponível
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL não configurada' })
  }

  try {
    if (req.method === 'GET') {
      const sql = getDatabase()
      const matches = await sql`
        SELECT id, title, match_date, created_at 
        FROM matches 
        ORDER BY match_date DESC, created_at DESC
      `
      
      return res.status(200).json(matches)
    }
    
    if (req.method === 'POST') {
      const { title, player1Id, player2Id } = req.body
      
      if (!title || !player1Id || !player2Id) {
        return res.status(400).json({ error: 'Título e IDs dos jogadores são obrigatórios' })
      }
      
      const sql = getDatabase()
      
      // Criar a partida
      const [newMatch] = await sql`
        INSERT INTO matches (title, match_date) 
        VALUES (${title}, CURRENT_DATE) 
        RETURNING id, title, match_date, created_at
      `
      
      // Adicionar participantes
      await sql`
        INSERT INTO match_participants (match_id, player_id) 
        VALUES (${newMatch.id}, ${player1Id})
      `
      
      await sql`
        INSERT INTO match_participants (match_id, player_id) 
        VALUES (${newMatch.id}, ${player2Id})
      `
      
      // Adicionar resultados (player1 vence por padrão)
      await sql`
        INSERT INTO match_results (match_id, player_id, position) 
        VALUES (${newMatch.id}, ${player1Id}, 1)
      `
      
      await sql`
        INSERT INTO match_results (match_id, player_id, position) 
        VALUES (${newMatch.id}, ${player2Id}, 2)
      `
      
      return res.status(201).json(newMatch)
    }
    
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro na API:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

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

// GET - Listar todos os jogadores
export default async function handler(req, res) {
  // Verificar se o banco está disponível
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL não configurada' })
  }

  try {
    if (req.method === 'GET') {
      const sql = getDatabase()
      const players = await sql`
        SELECT id, name, matches, wins, losses, rating, created_at 
        FROM players 
        ORDER BY rating DESC, wins DESC, name ASC
      `
      
      return res.status(200).json(players)
    }
    
    if (req.method === 'POST') {
      const { name } = req.body
      
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nome é obrigatório' })
      }
      
      const sql = getDatabase()
      const [newPlayer] = await sql`
        INSERT INTO players (name, matches, wins, losses, rating) 
        VALUES (${name.trim()}, 0, 0, 0, 1000) 
        RETURNING id, name, matches, wins, losses, rating, created_at
      `
      
      return res.status(201).json(newPlayer)
    }
    
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Jogador com este nome já existe' })
    }
    
    console.error('Erro na API:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

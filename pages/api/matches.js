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
        SELECT id, type, players, winner, date 
        FROM matches 
        ORDER BY date DESC
      `
      
      return res.status(200).json(matches)
    }
    
    if (req.method === 'POST') {
      const { type, players, winner } = req.body
      
      if (!type || !players || !winner) {
        return res.status(400).json({ error: 'Tipo, jogadores e vencedor são obrigatórios' })
      }
      
      if (!['individual', 'dupla'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser "individual" ou "dupla"' })
      }
      
      if (!Array.isArray(players) || players.length === 0) {
        return res.status(400).json({ error: 'Jogadores deve ser um array não vazio' })
      }
      
      if (!Array.isArray(winner) || winner.length === 0) {
        return res.status(400).json({ error: 'Vencedor deve ser um array não vazio' })
      }
      
      const sql = getDatabase()
      
      // Criar a partida com a nova estrutura
      const [newMatch] = await sql`
        INSERT INTO matches (type, players, winner) 
        VALUES (${type}, ${players}, ${winner}) 
        RETURNING id, type, players, winner, date
      `
      
      return res.status(201).json(newMatch)
    }
    
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro na API:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

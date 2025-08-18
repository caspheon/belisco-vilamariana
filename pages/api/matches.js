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
      const matches = await sql`
        SELECT id, type, players, winner, date 
        FROM matches 
        ORDER BY date DESC
      `
      
      return res.status(200).json(matches)
    }
    
    if (req.method === 'POST') {
      const { type, players, winner } = req.body
      
      // Debug: log dos dados recebidos
      console.log('Creating match with data:', { type, players, winner })
      
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
      
      // VALIDAÇÃO CRÍTICA: Verificar se não há IDs sendo enviados
      const hasNumericPlayers = players.some(p => !isNaN(p) || /^\d+$/.test(p))
      const hasNumericWinners = winner.some(w => !isNaN(w) || /^\d+$/.test(w))
      
      if (hasNumericPlayers) {
        console.error('❌ ERRO CRÍTICO: IDs detectados em jogadores:', players)
        return res.status(400).json({ 
          error: 'Dados inválidos: IDs detectados em vez de nomes de jogadores. Por favor, use nomes válidos.' 
        })
      }
      
      if (hasNumericWinners) {
        console.error('❌ ERRO CRÍTICO: IDs detectados em vencedores:', winner)
        return res.status(400).json({ 
          error: 'Dados inválidos: IDs detectados em vez de nomes de vencedores. Por favor, use nomes válidos.' 
        })
      }
      
      // Verificar se todos os jogadores e vencedores são strings válidas
      const hasInvalidPlayers = players.some(p => typeof p !== 'string' || p.trim().length === 0)
      const hasInvalidWinners = winner.some(w => typeof w !== 'string' || w.trim().length === 0)
      
      if (hasInvalidPlayers) {
        return res.status(400).json({ 
          error: 'Dados inválidos: Todos os jogadores devem ser nomes válidos (strings não vazias)' 
        })
      }
      
      if (hasInvalidWinners) {
        return res.status(400).json({ 
          error: 'Dados inválidos: Todos os vencedores devem ser nomes válidos (strings não vazias)' 
        })
      }
      
      const sql = getDatabase()
      
      // Criar a partida com a nova estrutura
      const [newMatch] = await sql`
        INSERT INTO matches (type, players, winner, date) 
        VALUES (${type}, ${players}, ${winner}, NOW()) 
        RETURNING id, type, players, winner, date
      `
      
      // Debug: log da partida criada
      console.log('Match created:', newMatch)
      
      return res.status(200).json(newMatch)
    }
    
    if (req.method === 'DELETE') {
      const sql = getDatabase()
      
      // Apagar todas as partidas
      await sql`DELETE FROM matches`
      
      return res.status(200).json({ message: 'Todas as partidas foram apagadas com sucesso' })
    }
    
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro na API de partidas:', error)
    
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

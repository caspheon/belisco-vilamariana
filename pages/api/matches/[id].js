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

// DELETE - Apagar partida específica
export default async function handler(req, res) {
  try {
    // Verificar se o banco está disponível
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL não configurada')
      return res.status(500).json({ 
        error: 'Configuração de banco de dados não encontrada. Verifique se a variável DATABASE_URL está definida.' 
      })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID da partida é obrigatório e deve ser um número' })
      }

      const sql = getDatabase()
      
      // Verificar se a partida existe
      const [existingMatch] = await sql`
        SELECT id, type, players, winner FROM matches WHERE id = ${parseInt(id)}
      `
      
      if (!existingMatch) {
        return res.status(404).json({ error: 'Partida não encontrada' })
      }
      
      // Apagar a partida específica
      await sql`DELETE FROM matches WHERE id = ${parseInt(id)}`
      
      return res.status(200).json({ 
        message: `Partida ${existingMatch.type} foi apagada com sucesso`,
        deletedMatch: existingMatch
      })
    }
    
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro na API de exclusão de partida:', error)
    
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

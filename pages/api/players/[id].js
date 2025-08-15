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

// DELETE - Apagar jogador específico
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
        return res.status(400).json({ error: 'ID do jogador é obrigatório e deve ser um número' })
      }

      const sql = getDatabase()
      
      // Verificar se o jogador existe
      const [existingPlayer] = await sql`
        SELECT id, name FROM players WHERE id = ${parseInt(id)}
      `
      
      if (!existingPlayer) {
        return res.status(404).json({ error: 'Jogador não encontrado' })
      }
      
      // Apagar o jogador específico
      await sql`DELETE FROM players WHERE id = ${parseInt(id)}`
      
      return res.status(200).json({ 
        message: `Jogador "${existingPlayer.name}" foi apagado com sucesso`,
        deletedPlayer: existingPlayer
      })
    }
    
    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error) {
    console.error('Erro na API de exclusão de jogador:', error)
    
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

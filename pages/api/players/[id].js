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
// PUT - Editar nome do jogador específico
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

    if (req.method === 'PUT') {
      const { id } = req.query
      const { name } = req.body
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'ID do jogador é obrigatório e deve ser um número' })
      }

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nome do jogador é obrigatório e deve ser uma string válida' })
      }

      const sql = getDatabase()
      
      // Verificar se o jogador existe
      const [existingPlayer] = await sql`
        SELECT id, name FROM players WHERE id = ${parseInt(id)}
      `
      
      if (!existingPlayer) {
        return res.status(404).json({ error: 'Jogador não encontrado' })
      }

      // Verificar se já existe outro jogador com o mesmo nome
      const [duplicatePlayer] = await sql`
        SELECT id, name FROM players WHERE name = ${name.trim()} AND id != ${parseInt(id)}
      `
      
      if (duplicatePlayer) {
        return res.status(409).json({ error: 'Já existe um jogador com este nome' })
      }
      
      // Atualizar o nome do jogador
      await sql`
        UPDATE players 
        SET name = ${name.trim()}
        WHERE id = ${parseInt(id)}
      `
      
      // Atualizar todas as partidas que contêm o nome antigo
      const oldName = existingPlayer.name
      const newName = name.trim()
      
      // Buscar partidas que contêm o nome antigo
      const matchesToUpdate = await sql`
        SELECT id, players, winner FROM matches 
        WHERE players @> ${[oldName]} OR winner @> ${[oldName]}
      `
      
      let updatedMatches = 0
      
      for (const match of matchesToUpdate) {
        let needsUpdate = false
        let updatedPlayers = [...match.players]
        let updatedWinner = Array.isArray(match.winner) ? [...match.winner] : [match.winner]
        
        // Atualizar jogadores
        for (let i = 0; i < updatedPlayers.length; i++) {
          if (updatedPlayers[i] === oldName) {
            updatedPlayers[i] = newName
            needsUpdate = true
          }
        }
        
        // Atualizar vencedores
        for (let i = 0; i < updatedWinner.length; i++) {
          if (updatedWinner[i] === oldName) {
            updatedWinner[i] = newName
            needsUpdate = true
          }
        }
        
        // Atualizar a partida se necessário
        if (needsUpdate) {
          await sql`
            UPDATE matches 
            SET players = ${updatedPlayers}, winner = ${updatedWinner}
            WHERE id = ${match.id}
          `
          updatedMatches++
        }
      }
      
      // ===== SINCRONIZAR ESTATÍSTICAS DE TODOS OS JOGADORES =====
      console.log('🔄 Sincronizando estatísticas após mudança de nome...')
      
      // Buscar todos os jogadores
      const allPlayers = await sql`SELECT id, name FROM players ORDER BY id`
      
      // Buscar todas as partidas atualizadas
      const allMatches = await sql`SELECT id, players, winner, type FROM matches ORDER BY id`
      
      let playersStatsUpdated = 0
      
      for (const player of allPlayers) {
        let individualWins = 0
        let duplaWins = 0
        let individualMatches = 0
        let duplaMatches = 0
        
        // Calcular estatísticas baseadas nas partidas
        for (const match of allMatches) {
          if (!match.players || !match.winner) continue
          
          const isPlayerInMatch = match.players.includes(player.name)
          if (!isPlayerInMatch) continue
          
          const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
          const isPlayerWinner = winners.includes(player.name)
          
          if (match.type === 'individual') {
            individualMatches++
            if (isPlayerWinner) individualWins++
          } else if (match.type === 'dupla') {
            duplaMatches++
            if (isPlayerWinner) duplaWins++
          }
        }
        
        const totalWins = individualWins + duplaWins
        const totalMatches = individualMatches + duplaMatches
        const totalLosses = totalMatches - totalWins
        
        // Calcular novo rating (sistema simples)
        const newRating = Math.max(1000, 1000 + (totalWins * 25) - (totalLosses * 15))
        
        // Atualizar estatísticas do jogador
        await sql`
          UPDATE players 
          SET 
            matches = ${totalMatches},
            wins = ${totalWins},
            losses = ${totalLosses},
            rating = ${newRating}
          WHERE id = ${player.id}
        `
        
        playersStatsUpdated++
      }
      
      console.log(`✅ Estatísticas de ${playersStatsUpdated} jogadores sincronizadas`)
      
      return res.status(200).json({ 
        message: `Nome do jogador foi atualizado de "${oldName}" para "${newName}". ${updatedMatches} partidas foram atualizadas e estatísticas de ${playersStatsUpdated} jogadores foram sincronizadas.`,
        updatedPlayer: { id: parseInt(id), name: newName },
        updatedMatches: updatedMatches,
        playersStatsUpdated: playersStatsUpdated
      })
    }
    
    return res.status(405).json({ error: 'Método não permitido. Use DELETE para apagar ou PUT para editar.' })
  } catch (error) {
    console.error('Erro na API de exclusão/edição de jogador:', error)
    
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

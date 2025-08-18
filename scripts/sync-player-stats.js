import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configuração do banco Neon
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

async function syncPlayerStats() {
  try {
    console.log('🔄 Sincronizando estatísticas dos jogadores com os dados das partidas...')
    
    const sql = getDatabase()
    
    // Buscar todos os jogadores
    const players = await sql`
      SELECT id, name, matches, wins, losses, rating 
      FROM players 
      ORDER BY rating DESC
    `
    
    // Buscar todas as partidas
    const matches = await sql`
      SELECT id, type, players, winner, date 
      FROM matches 
      ORDER BY date DESC
    `
    
    console.log(`📊 Total de jogadores: ${players.length}`)
    console.log(`🎱 Total de partidas: ${matches.length}`)
    
    let updatedPlayers = 0
    
    // Sincronizar cada jogador
    for (const player of players) {
      console.log(`\n👤 Sincronizando ${player.name}:`)
      
      // Calcular estatísticas baseadas nas partidas
      let calculatedMatches = 0
      let calculatedWins = 0
      let calculatedLosses = 0
      
      for (const match of matches) {
        if (!match.players || !match.winner) continue
        
        const isPlayerInMatch = match.players.includes(player.name)
        if (!isPlayerInMatch) continue
        
        calculatedMatches++
        
        const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
        const isPlayerWinner = winners.includes(player.name)
        
        if (isPlayerWinner) {
          calculatedWins++
        } else {
          calculatedLosses++
        }
      }
      
      console.log(`   Estatísticas antigas: ${player.matches} partidas, ${player.wins} vitórias, ${player.losses} derrotas`)
      console.log(`   Estatísticas calculadas: ${calculatedMatches} partidas, ${calculatedWins} vitórias, ${calculatedLosses} derrotas`)
      
      // Verificar se precisa atualizar
      if (calculatedMatches !== player.matches || 
          calculatedWins !== player.wins || 
          calculatedLosses !== player.losses) {
        
        // Calcular novo rating baseado nas vitórias
        const newRating = Math.max(1000, 1000 + (calculatedWins * 25) - (calculatedLosses * 15))
        
        // Atualizar estatísticas do jogador
        await sql`
          UPDATE players 
          SET matches = ${calculatedMatches}, 
              wins = ${calculatedWins}, 
              losses = ${calculatedLosses},
              rating = ${newRating}
          WHERE id = ${player.id}
        `
        
        console.log(`   ✅ Atualizado: ${calculatedMatches} partidas, ${calculatedWins} vitórias, ${calculatedLosses} derrotas, rating ${newRating}`)
        updatedPlayers++
      } else {
        console.log(`   ✅ Dados já estão sincronizados`)
      }
    }
    
    console.log('\n🎉 Sincronização concluída!')
    console.log(`📊 Total de jogadores atualizados: ${updatedPlayers}`)
    
    if (updatedPlayers > 0) {
      console.log('\n💡 As estatísticas agora estão sincronizadas com os dados das partidas.')
      console.log('🔄 Execute o script de verificação novamente para confirmar a consistência.')
    } else {
      console.log('\n🎯 Todas as estatísticas já estavam sincronizadas!')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error)
    process.exit(1)
  }
}

// Executar a sincronização
syncPlayerStats()

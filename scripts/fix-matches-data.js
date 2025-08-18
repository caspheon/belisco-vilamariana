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

async function fixMatchesData() {
  try {
    console.log('🔍 Verificando dados das partidas...')
    
    const sql = getDatabase()
    
    // Buscar todas as partidas
    const matches = await sql`
      SELECT id, type, players, winner, date 
      FROM matches 
      ORDER BY date DESC
    `
    
    console.log(`📊 Total de partidas encontradas: ${matches.length}`)
    
    // Verificar cada partida
    for (const match of matches) {
      console.log(`\n🎱 Partida #${match.id}:`)
      console.log(`   Tipo: ${match.type}`)
      console.log(`   Jogadores: ${JSON.stringify(match.players)}`)
      console.log(`   Vencedores: ${JSON.stringify(match.winner)}`)
      
      // Verificar se há números nos arrays
      const hasNumericPlayers = match.players.some(p => !isNaN(p))
      const hasNumericWinners = match.winner.some(w => !isNaN(w))
      
      if (hasNumericPlayers || hasNumericWinners) {
        console.log(`   ⚠️  PROBLEMA DETECTADO: Números encontrados nos dados!`)
        
        // Buscar nomes dos jogadores pelos IDs
        if (hasNumericPlayers) {
          console.log(`   🔧 Corrigindo jogadores...`)
          const playerNames = []
          
          for (const playerId of match.players) {
            if (!isNaN(playerId)) {
              const [player] = await sql`
                SELECT name FROM players WHERE id = ${parseInt(playerId)}
              `
              if (player) {
                playerNames.push(player.name)
                console.log(`      ID ${playerId} → ${player.name}`)
              } else {
                console.log(`      ❌ Jogador com ID ${playerId} não encontrado`)
              }
            } else {
              playerNames.push(playerId)
            }
          }
          
          // Atualizar a partida com os nomes corretos
          if (playerNames.length === match.players.length) {
            await sql`
              UPDATE matches 
              SET players = ${playerNames} 
              WHERE id = ${match.id}
            `
            console.log(`   ✅ Jogadores corrigidos: ${JSON.stringify(playerNames)}`)
          }
        }
        
        if (hasNumericWinners) {
          console.log(`   🔧 Corrigindo vencedores...`)
          const winnerNames = []
          
          for (const winnerId of match.winner) {
            if (!isNaN(winnerId)) {
              const [player] = await sql`
                SELECT name FROM players WHERE id = ${parseInt(winnerId)}
              `
              if (player) {
                winnerNames.push(player.name)
                console.log(`      ID ${winnerId} → ${player.name}`)
              } else {
                console.log(`      ❌ Jogador com ID ${winnerId} não encontrado`)
              }
            } else {
              winnerNames.push(winnerId)
            }
          }
          
          // Atualizar a partida com os nomes corretos
          if (winnerNames.length === match.winner.length) {
            await sql`
              UPDATE matches 
              SET winner = ${winnerNames} 
              WHERE id = ${match.id}
            `
            console.log(`   ✅ Vencedores corrigidos: ${JSON.stringify(winnerNames)}`)
          }
        }
      } else {
        console.log(`   ✅ Dados corretos`)
      }
    }
    
    console.log('\n🎉 Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
    process.exit(1)
  }
}

// Executar a verificação
fixMatchesData()

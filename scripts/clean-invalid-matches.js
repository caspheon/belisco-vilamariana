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

async function cleanInvalidMatches() {
  try {
    console.log('🧹 Limpando partidas com jogadores inválidos...')
    
    const sql = getDatabase()
    
    // Buscar todas as partidas
    const matches = await sql`
      SELECT id, type, players, winner, date 
      FROM matches 
      ORDER BY date DESC
    `
    
    console.log(`📊 Total de partidas encontradas: ${matches.length}`)
    
    let invalidMatches = 0
    let deletedMatches = 0
    
    // Verificar cada partida
    for (const match of matches) {
      // Verificar se há números nos arrays
      const hasNumericPlayers = match.players.some(p => !isNaN(p))
      const hasNumericWinners = match.winner.some(w => !isNaN(w))
      
      if (hasNumericPlayers || hasNumericWinners) {
        invalidMatches++
        console.log(`\n🎱 Partida #${match.id} tem dados inválidos:`)
        console.log(`   Jogadores: ${JSON.stringify(match.players)}`)
        console.log(`   Vencedores: ${JSON.stringify(match.winner)}`)
        
        // Verificar se todos os IDs podem ser resolvidos
        let canResolveAll = true
        
        if (hasNumericPlayers) {
          for (const playerId of match.players) {
            if (!isNaN(playerId)) {
              const [player] = await sql`
                SELECT name FROM players WHERE id = ${parseInt(playerId)}
              `
              if (!player) {
                canResolveAll = false
                console.log(`   ❌ Jogador com ID ${playerId} não existe mais`)
                break
              }
            }
          }
        }
        
        if (hasNumericWinners) {
          for (const winnerId of match.winner) {
            if (!isNaN(winnerId)) {
              const [player] = await sql`
                SELECT name FROM players WHERE id = ${parseInt(winnerId)}
              `
              if (!player) {
                canResolveAll = false
                console.log(`   ❌ Vencedor com ID ${winnerId} não existe mais`)
                break
              }
            }
          }
        }
        
        if (!canResolveAll) {
          console.log(`   🗑️  Deletando partida #${match.id}...`)
          await sql`DELETE FROM matches WHERE id = ${match.id}`
          deletedMatches++
          console.log(`   ✅ Partida #${match.id} deletada`)
        }
      }
    }
    
    console.log('\n🎉 Limpeza concluída!')
    console.log(`📊 Total de partidas inválidas: ${invalidMatches}`)
    console.log(`🗑️  Total de partidas deletadas: ${deletedMatches}`)
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error)
    process.exit(1)
  }
}

// Executar a limpeza
cleanInvalidMatches()

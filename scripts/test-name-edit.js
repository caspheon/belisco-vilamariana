import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ DATABASE_URL não configurada')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function testNameEdit() {
  try {
    console.log('🧪 Testando sincronização de estatísticas após edição de nome...')
    
    // Buscar jogadores com estatísticas
    const players = await sql`SELECT id, name, matches, wins, losses, rating FROM players ORDER BY id LIMIT 5`
    console.log('\n📊 Jogadores antes da edição:')
    
    for (const player of players) {
      console.log(`  ${player.name}: ${player.wins}V/${player.matches} partidas, Rating: ${player.rating}`)
    }
    
    // Buscar algumas partidas
    const matches = await sql`SELECT id, players, winner, type FROM matches ORDER BY id DESC LIMIT 3`
    console.log('\n🎱 Últimas partidas:')
    
    for (const match of matches) {
      console.log(`  Partida #${match.id} (${match.type}): ${match.players.join(' vs ')} → Vencedor: ${Array.isArray(match.winner) ? match.winner.join(', ') : match.winner}`)
    }
    
    // Verificar se há inconsistências
    console.log('\n🔍 Verificando inconsistências...')
    
    let hasInconsistencies = false
    
    for (const player of players) {
      let calculatedWins = 0
      let calculatedMatches = 0
      
      // Calcular baseado nas partidas
      for (const match of matches) {
        if (!match.players || !match.winner) continue
        
        const isPlayerInMatch = match.players.includes(player.name)
        if (!isPlayerInMatch) continue
        
        calculatedMatches++
        
        const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
        if (winners.includes(player.name)) {
          calculatedWins++
        }
      }
      
      if (calculatedWins !== player.wins || calculatedMatches !== player.matches) {
        hasInconsistencies = true
        console.log(`  ❌ ${player.name}: Armazenado ${player.wins}V/${player.matches} vs Calculado ${calculatedWins}V/${calculatedMatches}`)
      } else {
        console.log(`  ✅ ${player.name}: Consistente ${player.wins}V/${player.matches}`)
      }
    }
    
    if (hasInconsistencies) {
      console.log('\n⚠️  Encontradas inconsistências! Execute o script de correção.')
    } else {
      console.log('\n🎉 Todas as estatísticas estão consistentes!')
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar o teste
testNameEdit()
  .then(() => {
    console.log('\n🏁 Teste finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })

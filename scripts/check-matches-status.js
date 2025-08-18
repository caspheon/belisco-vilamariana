import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ DATABASE_URL não configurada')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function checkMatchesStatus() {
  try {
    console.log('🔍 Verificando status das partidas...')
    
    // Buscar todas as partidas
    const matches = await sql`SELECT id, players, winner FROM matches ORDER BY id DESC LIMIT 10`
    console.log(`📊 Últimas ${matches.length} partidas:`)
    
    let hasIds = false
    
    for (const match of matches) {
      const hasPlayerIds = match.players.some(p => !isNaN(p))
      const hasWinnerIds = Array.isArray(match.winner) 
        ? match.winner.some(w => !isNaN(w))
        : !isNaN(match.winner)
      
      if (hasPlayerIds || hasWinnerIds) {
        hasIds = true
        console.log(`  ❌ Partida #${match.id}: Contém IDs`)
        console.log(`     Jogadores: [${match.players.join(', ')}]`)
        console.log(`     Vencedor: [${Array.isArray(match.winner) ? match.winner.join(', ') : match.winner}]`)
      } else {
        console.log(`  ✅ Partida #${match.id}: Nomes corretos`)
      }
    }
    
    if (!hasIds) {
      console.log('\n🎉 Todas as partidas verificadas estão usando nomes corretos!')
    } else {
      console.log('\n⚠️  Encontradas partidas com IDs. Execute o script de sincronização.')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

checkMatchesStatus()

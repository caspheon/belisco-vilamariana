import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ DATABASE_URL não configurada')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function fixAllPlayerNames() {
  try {
    console.log('🔧 Iniciando correção de todos os nomes de jogadores...')
    
    // Buscar todos os jogadores
    const players = await sql`SELECT id, name FROM players ORDER BY id`
    console.log(`📊 Encontrados ${players.length} jogadores`)
    
    // Criar mapa de IDs para nomes
    const playerIdToName = {}
    players.forEach(player => {
      playerIdToName[player.id] = player.name
    })
    
    // Buscar todas as partidas
    const matches = await sql`SELECT id, players, winner FROM matches ORDER BY id`
    console.log(`🎱 Encontradas ${matches.length} partidas`)
    
    let updatedMatches = 0
    let totalUpdates = 0
    
    // Verificar cada partida
    for (const match of matches) {
      let needsUpdate = false
      let updatedPlayers = [...match.players]
      let updatedWinner = Array.isArray(match.winner) ? [...match.winner] : [match.winner]
      
      // Verificar se há IDs em vez de nomes nos jogadores
      for (let i = 0; i < updatedPlayers.length; i++) {
        const player = updatedPlayers[i]
        if (!isNaN(player) && playerIdToName[parseInt(player)]) {
          const oldName = updatedPlayers[i]
          updatedPlayers[i] = playerIdToName[parseInt(player)]
          console.log(`  🔄 Partida #${match.id}: ID ${oldName} → Nome "${updatedPlayers[i]}"`)
          needsUpdate = true
          totalUpdates++
        }
      }
      
      // Verificar se há IDs em vez de nomes nos vencedores
      for (let i = 0; i < updatedWinner.length; i++) {
        const winner = updatedWinner[i]
        if (!isNaN(winner) && playerIdToName[parseInt(winner)]) {
          const oldName = updatedWinner[i]
          updatedWinner[i] = playerIdToName[parseInt(winner)]
          console.log(`  🏆 Partida #${match.id}: Vencedor ID ${oldName} → Nome "${updatedWinner[i]}"`)
          needsUpdate = true
          totalUpdates++
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
        console.log(`  ✅ Partida #${match.id} atualizada`)
      }
    }
    
    console.log('\n📋 Resumo da Correção:')
    console.log(`  • Partidas verificadas: ${matches.length}`)
    console.log(`  • Partidas atualizadas: ${updatedMatches}`)
    console.log(`  • Total de correções: ${totalUpdates}`)
    
    if (updatedMatches > 0) {
      console.log('\n🎉 Correção concluída com sucesso!')
      console.log('💡 Agora todas as partidas estão usando os nomes corretos dos jogadores.')
      console.log('🔄 Execute o script de sincronização de estatísticas para corrigir o ranking.')
    } else {
      console.log('\n✅ Nenhuma correção necessária. Todos os nomes já estão corretos.')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
    process.exit(1)
  }
}

// Executar a correção
fixAllPlayerNames()
  .then(() => {
    console.log('\n🏁 Script finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })

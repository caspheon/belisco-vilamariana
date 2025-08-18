import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ DATABASE_URL não configurada')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function fixEverything() {
  try {
    console.log('🔧 Iniciando correção completa do banco de dados...')
    
    // ===== PASSO 1: CORRIGIR NOMES NAS PARTIDAS =====
    console.log('\n📝 PASSO 1: Corrigindo nomes nas partidas...')
    
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
    
    console.log(`\n📋 Resumo da Correção de Partidas:`)
    console.log(`  • Partidas verificadas: ${matches.length}`)
    console.log(`  • Partidas atualizadas: ${updatedMatches}`)
    console.log(`  • Total de correções: ${totalUpdates}`)
    
    // ===== PASSO 2: SINCRONIZAR ESTATÍSTICAS DOS JOGADORES =====
    console.log('\n📊 PASSO 2: Sincronizando estatísticas dos jogadores...')
    
    // Buscar jogadores novamente (pode ter mudado)
    const updatedPlayers = await sql`SELECT id, name FROM players ORDER BY id`
    
    // Buscar partidas atualizadas
    const updatedMatchesData = await sql`SELECT id, players, winner, type FROM matches ORDER BY id`
    
    let playersUpdated = 0
    
    for (const player of updatedPlayers) {
      let individualWins = 0
      let duplaWins = 0
      let individualMatches = 0
      let duplaMatches = 0
      
      // Calcular estatísticas baseadas nas partidas
      for (const match of updatedMatchesData) {
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
      
      console.log(`  ✅ ${player.name}: ${totalWins}V/${totalMatches} partidas, Rating: ${newRating}`)
      playersUpdated++
    }
    
    console.log(`\n📋 Resumo da Sincronização de Estatísticas:`)
    console.log(`  • Jogadores atualizados: ${playersUpdated}`)
    
    // ===== RESUMO FINAL =====
    console.log('\n🎉 CORREÇÃO COMPLETA FINALIZADA!')
    console.log('✅ Todos os nomes nas partidas foram corrigidos')
    console.log('✅ Todas as estatísticas dos jogadores foram sincronizadas')
    console.log('✅ Ranking agora está consistente com as partidas')
    console.log('✅ Partidas recentes mostram nomes corretos')
    console.log('✅ Sem mais diferenças entre vitórias calculadas e armazenadas')
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
    process.exit(1)
  }
}

// Executar a correção completa
fixEverything()
  .then(() => {
    console.log('\n🏁 Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })

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

async function checkStatsConsistency() {
  try {
    console.log('🔍 Verificando consistência entre estatísticas dos jogadores e dados das partidas...')
    
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
    
    let inconsistencies = 0
    
    // Verificar cada jogador
    for (const player of players) {
      console.log(`\n👤 Verificando ${player.name}:`)
      console.log(`   Estatísticas no banco: ${player.matches} partidas, ${player.wins} vitórias, ${player.losses} derrotas`)
      
      // Calcular estatísticas baseadas nas partidas
      let calculatedMatches = 0
      let calculatedWins = 0
      let calculatedLosses = 0
      let individualWins = 0
      let duplaWins = 0
      let individualMatches = 0
      let duplaMatches = 0
      
      for (const match of matches) {
        if (!match.players || !match.winner) continue
        
        const isPlayerInMatch = match.players.includes(player.name)
        if (!isPlayerInMatch) continue
        
        calculatedMatches++
        
        const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
        const isPlayerWinner = winners.includes(player.name)
        
        if (isPlayerWinner) {
          calculatedWins++
          if (match.type === 'individual') {
            individualWins++
          } else if (match.type === 'dupla') {
            duplaWins++
          }
        } else {
          calculatedLosses++
        }
        
        if (match.type === 'individual') {
          individualMatches++
        } else if (match.type === 'dupla') {
          duplaMatches++
        }
      }
      
      console.log(`   Estatísticas calculadas: ${calculatedMatches} partidas, ${calculatedWins} vitórias, ${calculatedLosses} derrotas`)
      console.log(`   Detalhado: ${individualWins}V/${individualMatches} individual, ${duplaWins}V/${duplaMatches} dupla`)
      
      // Verificar inconsistências
      const hasInconsistency = 
        calculatedMatches !== player.matches ||
        calculatedWins !== player.wins ||
        calculatedLosses !== player.losses
      
      if (hasInconsistency) {
        inconsistencies++
        console.log(`   ⚠️  INCONSISTÊNCIA DETECTADA!`)
        console.log(`      Partidas: ${player.matches} vs ${calculatedMatches}`)
        console.log(`      Vitórias: ${player.wins} vs ${calculatedWins}`)
        console.log(`      Derrotas: ${player.losses} vs ${calculatedLosses}`)
      } else {
        console.log(`   ✅ Dados consistentes`)
      }
    }
    
    console.log('\n📊 Resumo da verificação:')
    if (inconsistencies === 0) {
      console.log('🎉 Nenhuma inconsistência encontrada! Dados estão perfeitamente sincronizados.')
    } else {
      console.log(`⚠️  ${inconsistencies} jogadores com dados inconsistentes encontrados.`)
      console.log('💡 Considere executar um script de sincronização para corrigir as estatísticas.')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error)
    process.exit(1)
  }
}

// Executar a verificação
checkStatsConsistency()

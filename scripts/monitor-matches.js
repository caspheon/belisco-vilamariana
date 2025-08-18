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

async function monitorMatches() {
  try {
    console.log('🔍 Monitorando partidas em busca de dados corrompidos...')
    
    const sql = getDatabase()
    
    // Buscar todas as partidas
    const matches = await sql`
      SELECT id, type, players, winner, date 
      FROM matches 
      ORDER BY date DESC
    `
    
    console.log(`📊 Total de partidas monitoradas: ${matches.length}`)
    
    let corruptedMatches = 0
    let fixedMatches = 0
    
    // Verificar cada partida
    for (const match of matches) {
      // Verificar se há números nos arrays
      const hasNumericPlayers = match.players.some(p => !isNaN(p))
      const hasNumericWinners = match.winner.some(w => !isNaN(w))
      
      if (hasNumericPlayers || hasNumericWinners) {
        corruptedMatches++
        console.log(`\n⚠️  PARTIDA CORROMPIDA DETECTADA #${match.id}:`)
        console.log(`   Tipo: ${match.type}`)
        console.log(`   Jogadores: ${JSON.stringify(match.players)}`)
        console.log(`   Vencedores: ${JSON.stringify(match.winner)}`)
        
        // Tentar corrigir automaticamente
        let canFix = true
        let fixedPlayers = [...match.players]
        let fixedWinners = [...match.winner]
        
        // Corrigir jogadores
        if (hasNumericPlayers) {
          for (let i = 0; i < fixedPlayers.length; i++) {
            const player = fixedPlayers[i]
            if (!isNaN(player)) {
              const [playerData] = await sql`
                SELECT name FROM players WHERE id = ${parseInt(player)}
              `
              if (playerData) {
                fixedPlayers[i] = playerData.name
                console.log(`   🔧 Corrigido jogador ID ${player} → ${playerData.name}`)
              } else {
                canFix = false
                console.log(`   ❌ Não foi possível corrigir jogador ID ${player}`)
                break
              }
            }
          }
        }
        
        // Corrigir vencedores
        if (hasNumericWinners && canFix) {
          for (let i = 0; i < fixedWinners.length; i++) {
            const winner = fixedWinners[i]
            if (!isNaN(winner)) {
              const [playerData] = await sql`
                SELECT name FROM players WHERE id = ${parseInt(winner)}
              `
              if (playerData) {
                fixedWinners[i] = playerData.name
                console.log(`   🔧 Corrigido vencedor ID ${winner} → ${playerData.name}`)
              } else {
                canFix = false
                console.log(`   ❌ Não foi possível corrigir vencedor ID ${winner}`)
                break
              }
            }
          }
        }
        
        // Aplicar correção se possível
        if (canFix) {
          await sql`
            UPDATE matches 
            SET players = ${fixedPlayers}, winner = ${fixedWinners}
            WHERE id = ${match.id}
          `
          console.log(`   ✅ Partida #${match.id} corrigida automaticamente`)
          fixedMatches++
        } else {
          console.log(`   🗑️  Partida #${match.id} não pode ser corrigida - considere deletá-la`)
        }
      }
    }
    
    if (corruptedMatches === 0) {
      console.log('\n🎉 Nenhuma partida corrompida encontrada! Sistema funcionando perfeitamente.')
    } else {
      console.log('\n📊 Resumo do monitoramento:')
      console.log(`   Partidas corrompidas encontradas: ${corruptedMatches}`)
      console.log(`   Partidas corrigidas automaticamente: ${fixedMatches}`)
      console.log(`   Partidas que precisam de atenção: ${corruptedMatches - fixedMatches}`)
    }
    
  } catch (error) {
    console.error('❌ Erro durante o monitoramento:', error)
    process.exit(1)
  }
}

// Executar o monitoramento
monitorMatches()

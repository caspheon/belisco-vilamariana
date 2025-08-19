const { neon } = require('@neondatabase/serverless')

// Configuração do banco de dados
const sql = neon(process.env.DATABASE_URL)

async function adjustPlayerRatings() {
  try {
    console.log('🔄 Ajustando ratings dos jogadores para o novo sistema...')
    
    // Buscar todos os jogadores
    const players = await sql`SELECT * FROM players`
    console.log(`📊 Encontrados ${players.length} jogadores`)
    
    // Ajustar ratings baseado no histórico de partidas
    for (const player of players) {
      console.log(`\n👤 Processando jogador: ${player.name}`)
      
      // Buscar todas as partidas do jogador
      const matches = await sql`
        SELECT * FROM matches 
        WHERE ${player.name} = ANY(players)
        ORDER BY date ASC
      `
      
      console.log(`   📅 ${matches.length} partidas encontradas`)
      
      let rating = 1000 // Começar com 1000 pontos
      let wins = 0
      let losses = 0
      let totalMatches = 0
      
      // Calcular rating baseado no histórico
      for (const match of matches) {
        totalMatches++
        
        // Verificar se o jogador venceu
        const isWinner = Array.isArray(match.winner) 
          ? match.winner.includes(player.name)
          : match.winner === player.name
        
        if (isWinner) {
          wins++
          rating += 50 // +50 pontos por vitória
        } else {
          losses++
          rating = Math.max(1000, rating - 20) // -20 pontos por derrota (mínimo 1000)
        }
      }
      
      console.log(`   🏆 Vitórias: ${wins}, Derrotas: ${losses}`)
      console.log(`   📊 Rating calculado: ${rating} (era: ${player.rating})`)
      
      // Atualizar jogador no banco
      await sql`
        UPDATE players 
        SET rating = ${rating}, wins = ${wins}, losses = ${losses}, matches = ${totalMatches}
        WHERE id = ${player.id}
      `
      
      console.log(`   ✅ Jogador atualizado com sucesso!`)
    }
    
    console.log('\n🎉 Processo concluído! Todos os jogadores foram ajustados.')
    
    // Mostrar estatísticas finais
    const finalStats = await sql`
      SELECT 
        COUNT(*) as total_players,
        AVG(rating) as avg_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating
      FROM players
    `
    
    console.log('\n📈 Estatísticas Finais:')
    console.log(`   👥 Total de jogadores: ${finalStats[0].total_players}`)
    console.log(`   📊 Rating médio: ${Math.round(finalStats[0].avg_rating)}`)
    console.log(`   📉 Rating mínimo: ${finalStats[0].min_rating}`)
    console.log(`   📈 Rating máximo: ${finalStats[0].max_rating}`)
    
    // Mostrar distribuição por divisões
    console.log('\n🏆 Distribuição por Divisões:')
    const divisionStats = await sql`
      SELECT 
        CASE 
          WHEN rating >= 8000 THEN '👑 Lendário'
          WHEN rating >= 7300 THEN '🔱 Grão-Mestre I'
          WHEN rating >= 7000 THEN '🔱 Grão-Mestre II'
          WHEN rating >= 6700 THEN '🔱 Grão-Mestre III'
          WHEN rating >= 6400 THEN '🔶 Mestre I'
          WHEN rating >= 6100 THEN '🔶 Mestre II'
          WHEN rating >= 5800 THEN '🔶 Mestre III'
          WHEN rating >= 5500 THEN '💎 Platina I'
          WHEN rating >= 5200 THEN '💎 Platina II'
          WHEN rating >= 4900 THEN '💎 Platina III'
          WHEN rating >= 4600 THEN '💠 Diamante I'
          WHEN rating >= 4300 THEN '💠 Diamante II'
          WHEN rating >= 4000 THEN '💠 Diamante III'
          WHEN rating >= 3700 THEN '🥇 Ouro I'
          WHEN rating >= 3400 THEN '🥇 Ouro II'
          WHEN rating >= 3100 THEN '🥇 Ouro III'
          WHEN rating >= 2800 THEN '🥈 Prata I'
          WHEN rating >= 2500 THEN '🥈 Prata II'
          WHEN rating >= 2200 THEN '🥈 Prata III'
          WHEN rating >= 1900 THEN '🥉 Bronze I'
          WHEN rating >= 1600 THEN '🥉 Bronze II'
          WHEN rating >= 1300 THEN '🥉 Bronze III'
          ELSE '🐣 Iniciante'
        END as division,
        COUNT(*) as count
      FROM players 
      GROUP BY division 
      ORDER BY 
        CASE division
          WHEN '👑 Lendário' THEN 1
          WHEN '🔱 Grão-Mestre I' THEN 2
          WHEN '🔱 Grão-Mestre II' THEN 3
          WHEN '🔱 Grão-Mestre III' THEN 4
          WHEN '🔶 Mestre I' THEN 5
          WHEN '�� Mestre II' THEN 6
          WHEN '🔶 Mestre III' THEN 7
          WHEN '💎 Platina I' THEN 8
          WHEN '💎 Platina II' THEN 9
          WHEN '💎 Platina III' THEN 10
          WHEN '💠 Diamante I' THEN 11
          WHEN '💠 Diamante II' THEN 12
          WHEN '💠 Diamante III' THEN 13
          WHEN '🥇 Ouro I' THEN 14
          WHEN '🥇 Ouro II' THEN 15
          WHEN '🥇 Ouro III' THEN 16
          WHEN '🥈 Prata I' THEN 17
          WHEN '🥈 Prata II' THEN 18
          WHEN '🥈 Prata III' THEN 19
          WHEN '🥉 Bronze I' THEN 20
          WHEN '🥉 Bronze II' THEN 21
          WHEN '🥉 Bronze III' THEN 22
          ELSE 23
        END
    `
    
    divisionStats.forEach(stat => {
      console.log(`   ${stat.division}: ${stat.count} jogadores`)
    })
    
  } catch (error) {
    console.error('❌ Erro ao ajustar ratings:', error)
  } finally {
    process.exit(0)
  }
}

// Executar o script
adjustPlayerRatings()

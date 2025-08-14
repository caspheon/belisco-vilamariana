require('dotenv').config()
const { neon } = require('@neondatabase/serverless')

async function seedRealData() {
  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log('🌱 Iniciando seed dos dados reais...')
    
    // 1. Adicionar todos os jogadores
    console.log('👥 Adicionando jogadores...')
    const players = [
      'Pedro Meneguetti',
      'Zenatti',
      'Mexicano',
      'Wagner',
      'Guerra',
      'Caccuri',
      '"Seu Porra"',
      'Depetris',
      'Lucas',
      'Gui Scoleso',
      'Turazza',
      'Predinho',
      'Yuri'
    ]
    
    for (const playerName of players) {
      try {
        await sql`
          INSERT INTO players (name, matches, wins, losses, rating, created_at)
          VALUES (${playerName}, 0, 0, 0, 1000, CURRENT_TIMESTAMP)
          ON CONFLICT (name) DO NOTHING
        `
        console.log(`✅ Jogador ${playerName} adicionado/verificado`)
      } catch (error) {
        console.log(`⚠️ Jogador ${playerName}: ${error.message}`)
      }
    }
    
    // 2. Adicionar partidas em dupla
    console.log('\n🎱 Adicionando partidas em dupla...')
    const duplaMatches = [
      {
        players: ['Pedro Meneguetti', 'Zenatti'],
        winner: ['Pedro Meneguetti', 'Zenatti'],
        opponent: ['Mexicano', 'Wagner']
      },
      {
        players: ['Pedro Meneguetti', 'Wagner'],
        winner: ['Mexicano', 'Zenatti'],
        opponent: ['Mexicano', 'Zenatti']
      },
      {
        players: ['Pedro Meneguetti', 'Zenatti'],
        winner: ['Pedro Meneguetti', 'Zenatti'],
        opponent: ['Mexicano', 'Guerra']
      },
      {
        players: ['Guerra', 'Wagner'],
        winner: ['Guerra', 'Wagner'],
        opponent: ['Pedro Meneguetti', 'Zenatti']
      },
      {
        players: ['Guerra', 'Wagner'],
        winner: ['Guerra', 'Wagner'],
        opponent: ['Caccuri', 'Mexicano']
      },
      {
        players: ['Pedro Meneguetti', '"Seu Porra"'],
        winner: ['Pedro Meneguetti', '"Seu Porra"'],
        opponent: ['Guerra', 'Wagner']
      },
      {
        players: ['Guerra', 'Pedro Meneguetti'],
        winner: ['Guerra', 'Pedro Meneguetti'],
        opponent: ['Caccuri', '"Seu Porra"']
      },
      {
        players: ['Guerra', 'Wagner'],
        winner: ['Guerra', 'Wagner'],
        opponent: ['Pedro Meneguetti', 'Predinho']
      },
      {
        players: ['Guerra', 'Pedro Meneguetti'],
        winner: ['Guerra', 'Pedro Meneguetti'],
        opponent: ['Wagner', 'Yuri']
      },
      {
        players: ['Depetris', 'Pedro Meneguetti'],
        winner: ['Depetris', 'Pedro Meneguetti'], // Empate - ambos ganham
        opponent: ['Zenatti', 'Mexicano']
      },
      {
        players: ['Guerra', 'Pedro Meneguetti'],
        winner: ['Guerra', 'Pedro Meneguetti'],
        opponent: ['Mexicano', 'Zenatti']
      },
      {
        players: ['Guerra', 'Pedro Meneguetti'],
        winner: ['Guerra', 'Pedro Meneguetti'],
        opponent: ['Depetris', 'Lucas']
      },
      {
        players: ['Guerra', '"Seu Porra"'],
        winner: ['Guerra', '"Seu Porra"'],
        opponent: ['Depetris', 'Gui Scoleso']
      },
      {
        players: ['Depetris', 'Guerra'],
        winner: ['Turazza', 'Gui Scoleso'],
        opponent: ['Turazza', 'Gui Scoleso']
      }
    ]
    
    for (const match of duplaMatches) {
      try {
        // Buscar IDs dos jogadores
        const playerIds = await sql`
          SELECT id FROM players WHERE name = ANY(${match.players})
        `
        const opponentIds = await sql`
          SELECT id FROM players WHERE name = ANY(${match.opponent})
        `
        
        if (playerIds.length === 2 && opponentIds.length === 2) {
          const allPlayers = [...playerIds, ...opponentIds].map(p => p.id.toString())
          
          await sql`
            INSERT INTO matches (type, players, winner, date)
            VALUES ('dupla', ${allPlayers}, ${match.winner}, CURRENT_TIMESTAMP)
          `
          console.log(`✅ Partida dupla: ${match.winner.join(' & ')} vs ${match.opponent.join(' & ')}`)
        }
      } catch (error) {
        console.log(`⚠️ Erro na partida dupla: ${error.message}`)
      }
    }
    
    // 3. Adicionar partidas individuais
    console.log('\n🥇 Adicionando partidas individuais...')
    const individualMatches = [
      {
        players: ['Guerra', 'Pedro Meneguetti'],
        winner: ['Guerra']
      },
      {
        players: ['Guerra', 'Wagner'],
        winner: ['Guerra']
      },
      {
        players: ['Pedro Meneguetti', 'Wagner'],
        winner: ['Pedro Meneguetti', 'Wagner'] // Empate - ambos ganham
      }
    ]
    
    for (const match of individualMatches) {
      try {
        // Buscar IDs dos jogadores
        const playerIds = await sql`
          SELECT id FROM players WHERE name = ANY(${match.players})
        `
        
        if (playerIds.length === 2) {
          const allPlayers = playerIds.map(p => p.id.toString())
          
          await sql`
            INSERT INTO matches (type, players, winner, date)
            VALUES ('individual', ${allPlayers}, ${match.winner}, CURRENT_TIMESTAMP)
          `
          console.log(`✅ Partida individual: ${match.winner.join(' & ')} vs ${match.players.filter(p => !match.winner.includes(p)).join(' & ')}`)
        }
      } catch (error) {
        console.log(`⚠️ Erro na partida individual: ${error.message}`)
      }
    }
    
    console.log('\n🎉 Seed dos dados reais concluído com sucesso!')
    console.log('📊 Verificando estatísticas finais...')
    
    // 4. Verificar estatísticas finais
    const finalStats = await sql`
      SELECT name, matches, wins, losses, rating
      FROM players
      ORDER BY rating DESC, wins DESC
    `
    
    console.log('\n🏆 Ranking final dos jogadores:')
    finalStats.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name}: ${player.matches} partidas, ${player.wins}V/${player.losses}D, Rating: ${player.rating}`)
    })
    
    const totalMatches = await sql`SELECT COUNT(*) as count FROM matches`
    console.log(`\n📈 Total de partidas registradas: ${totalMatches[0].count}`)
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    process.exit(1)
  }
}

seedRealData()

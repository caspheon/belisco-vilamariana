require('dotenv').config()
const { neon } = require('@neondatabase/serverless')

async function testAPI() {
  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log('🧪 Testando APIs...')
    
    // 1. Testar conexão com banco
    console.log('\n📊 Testando conexão com banco...')
    const playerCount = await sql`SELECT COUNT(*) as count FROM players`
    console.log(`✅ Jogadores no banco: ${playerCount[0].count}`)
    
    const matchCount = await sql`SELECT COUNT(*) as count FROM matches`
    console.log(`✅ Partidas no banco: ${matchCount[0].count}`)
    
    // 2. Testar dados dos jogadores
    console.log('\n👥 Testando dados dos jogadores...')
    const players = await sql`
      SELECT id, name, matches, wins, losses, rating
      FROM players
      ORDER BY rating DESC
      LIMIT 5
    `
    
    console.log('Top 5 jogadores:')
    players.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} - Rating: ${player.rating}, ${player.matches} partidas`)
    })
    
    // 3. Testar dados das partidas
    console.log('\n🎱 Testando dados das partidas...')
    const matches = await sql`
      SELECT id, type, players, winner, date
      FROM matches
      ORDER BY date DESC
      LIMIT 3
    `
    
    console.log('Últimas 3 partidas:')
    matches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.type} - ${match.players.length} jogadores, vencedor: ${match.winner.join(', ')}`)
    })
    
    // 4. Testar se os IDs estão sendo retornados corretamente
    console.log('\n🔍 Verificando estrutura dos dados...')
    const samplePlayer = await sql`SELECT id, name FROM players LIMIT 1`
    if (samplePlayer.length > 0) {
      console.log(`✅ Exemplo de jogador: ID=${samplePlayer[0].id}, Nome=${samplePlayer[0].name}`)
      console.log(`✅ Tipo do ID: ${typeof samplePlayer[0].id}`)
    }
    
    console.log('\n🎉 Todos os testes passaram!')
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
    process.exit(1)
  }
}

testAPI()

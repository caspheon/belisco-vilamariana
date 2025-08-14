require('dotenv').config()

async function testLocalApp() {
  try {
    console.log('🧪 Testando aplicação local...')
    
    // 1. Verificar se o servidor está rodando
    console.log('\n🌐 Testando servidor local...')
    
    const playersResponse = await fetch('http://localhost:3001/api/players')
    console.log(`✅ Status da API /api/players: ${playersResponse.status}`)
    
    if (playersResponse.ok) {
      const players = await playersResponse.json()
      console.log(`✅ Jogadores retornados: ${players.length}`)
      
      if (players.length > 0) {
        console.log('📋 Primeiros 3 jogadores:')
        players.slice(0, 3).forEach((player, index) => {
          console.log(`  ${index + 1}. ${player.name} (ID: ${player.id})`)
        })
      }
    } else {
      console.log('❌ Erro na API /api/players')
      const errorText = await playersResponse.text()
      console.log(`   Erro: ${errorText}`)
    }
    
    const matchesResponse = await fetch('http://localhost:3001/api/matches')
    console.log(`✅ Status da API /api/matches: ${matchesResponse.status}`)
    
    if (matchesResponse.ok) {
      const matches = await matchesResponse.json()
      console.log(`✅ Partidas retornadas: ${matches.length}`)
    } else {
      console.log('❌ Erro na API /api/matches')
      const errorText = await matchesResponse.text()
      console.log(`   Erro: ${errorText}`)
    }
    
    console.log('\n🎉 Teste da aplicação local concluído!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
    console.log('\n💡 Dicas para resolver:')
    console.log('1. Certifique-se de que o servidor está rodando (npm run dev)')
    console.log('2. Verifique se a porta 3000 está livre')
    console.log('3. Verifique se o arquivo .env está configurado corretamente')
  }
}

testLocalApp()

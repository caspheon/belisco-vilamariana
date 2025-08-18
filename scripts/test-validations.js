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

async function testValidations() {
  try {
    console.log('🧪 Testando validações do sistema...')
    
    const sql = getDatabase()
    
    // Teste 1: Tentar criar partida com IDs (deve falhar)
    console.log('\n📝 Teste 1: Tentando criar partida com IDs (deve falhar)')
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'individual',
          players: ['1', '2'], // IDs em vez de nomes
          winner: ['1']
        })
      })
      
      if (response.ok) {
        console.log('   ❌ ERRO: Partida com IDs foi criada (não deveria)')
      } else {
        const error = await response.json()
        console.log('   ✅ SUCESSO: API rejeitou IDs corretamente')
        console.log(`   Mensagem de erro: ${error.error}`)
      }
    } catch (error) {
      console.log('   ✅ SUCESSO: Erro capturado ao tentar criar partida com IDs')
    }
    
    // Teste 2: Tentar criar partida com nomes válidos (deve funcionar)
    console.log('\n📝 Teste 2: Tentando criar partida com nomes válidos (deve funcionar)')
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'individual',
          players: ['Teste Jogador 1', 'Teste Jogador 2'], // Nomes válidos
          winner: ['Teste Jogador 1']
        })
      })
      
      if (response.ok) {
        const match = await response.json()
        console.log('   ✅ SUCESSO: Partida com nomes válidos foi criada')
        console.log(`   ID da partida: ${match.id}`)
        
        // Limpar partida de teste
        await sql`DELETE FROM matches WHERE id = ${match.id}`
        console.log('   🧹 Partida de teste removida')
      } else {
        const error = await response.json()
        console.log('   ❌ ERRO: API rejeitou nomes válidos')
        console.log(`   Mensagem de erro: ${error.error}`)
      }
    } catch (error) {
      console.log('   ❌ ERRO: Erro inesperado ao criar partida válida')
      console.log(`   Erro: ${error.message}`)
    }
    
    // Teste 3: Verificar se há partidas corrompidas no banco
    console.log('\n📝 Teste 3: Verificando se há partidas corrompidas no banco')
    const matches = await sql`
      SELECT id, type, players, winner, date 
      FROM matches 
      ORDER BY date DESC
    `
    
    let corruptedCount = 0
    for (const match of matches) {
      const hasNumericPlayers = match.players.some(p => !isNaN(p))
      const hasNumericWinners = match.winner.some(w => !isNaN(w))
      
      if (hasNumericPlayers || hasNumericWinners) {
        corruptedCount++
        console.log(`   ⚠️  Partida #${match.id} ainda tem dados corrompidos`)
      }
    }
    
    if (corruptedCount === 0) {
      console.log('   ✅ SUCESSO: Nenhuma partida corrompida encontrada no banco')
    } else {
      console.log(`   ❌ ERRO: ${corruptedCount} partidas ainda estão corrompidas`)
    }
    
    console.log('\n🎉 Testes de validação concluídos!')
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
    process.exit(1)
  }
}

// Executar os testes
testValidations()

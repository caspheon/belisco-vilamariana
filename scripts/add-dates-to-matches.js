import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('❌ DATABASE_URL não configurada')
  process.exit(1)
}

const sql = neon(databaseUrl)

async function addDatesToMatches() {
  try {
    console.log('📅 Adicionando datas às partidas existentes...')
    
    // Buscar partidas sem data
    const matchesWithoutDate = await sql`
      SELECT id, type, players, winner, date 
      FROM matches 
      WHERE date IS NULL OR date = '1970-01-01 00:00:00'
      ORDER BY id
    `
    
    console.log(`📊 Encontradas ${matchesWithoutDate.length} partidas sem data`)
    
    if (matchesWithoutDate.length === 0) {
      console.log('✅ Todas as partidas já têm data!')
      return
    }
    
    let updatedMatches = 0
    
    // Atualizar cada partida com uma data baseada no ID (mais antigas primeiro)
    for (const match of matchesWithoutDate) {
      // Criar uma data baseada no ID (mais antigas = datas mais antigas)
      const baseDate = new Date('2024-01-01') // Data base
      const daysToAdd = match.id * 2 // Cada partida 2 dias depois da anterior
      const matchDate = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
      
      // Adicionar hora aleatória entre 18:00 e 23:00 (UTC-3)
      const hour = 18 + Math.floor(Math.random() * 6)
      const minute = Math.floor(Math.random() * 60)
      matchDate.setHours(hour, minute, 0, 0)
      
      // Ajustar para UTC-3 (subtrair 3 horas)
      const utcDate = new Date(matchDate.getTime() - (3 * 60 * 60 * 1000))
      
      await sql`
        UPDATE matches 
        SET date = ${utcDate.toISOString()}
        WHERE id = ${match.id}
      `
      
      console.log(`  ✅ Partida #${match.id}: ${matchDate.toLocaleDateString('pt-BR')} ${matchDate.toLocaleTimeString('pt-BR')} (UTC-3)`)
      updatedMatches++
    }
    
    console.log(`\n📋 Resumo da Atualização:`)
    console.log(`  • Partidas verificadas: ${matchesWithoutDate.length}`)
    console.log(`  • Partidas atualizadas: ${updatedMatches}`)
    
    if (updatedMatches > 0) {
      console.log('\n🎉 Datas adicionadas com sucesso!')
      console.log('💡 Agora todas as partidas têm data e hora.')
    }
    
  } catch (error) {
    console.error('❌ Erro durante a atualização:', error)
    process.exit(1)
  }
}

// Executar a atualização
addDatesToMatches()
  .then(() => {
    console.log('\n🏁 Script finalizado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })

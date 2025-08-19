const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function recalculatePlayerPoints() {
  try {
    console.log('🔄 Iniciando recálculo de pontos dos jogadores...');
    
    // Buscar todos os jogadores
    const players = await sql`SELECT id, name FROM players`;
    
    console.log(`📊 Encontrados ${players.length} jogadores`);
    
    // Buscar todas as partidas
    const matches = await sql`SELECT * FROM matches ORDER BY date ASC`;
    
    console.log(`🎮 Encontradas ${matches.length} partidas`);
    
    // Para cada jogador, calcular pontos baseado no histórico
    for (const player of players) {
      let totalPoints = 1000; // Começa com 1000
      let totalWins = 0;
      let totalMatches = 0;
      
      console.log(`\n👤 Calculando pontos para: ${player.name}`);
      
      // Calcular pontos baseado em todas as partidas
      for (const match of matches) {
        if (!match.players || !match.winner) continue;
        
        const isPlayerInMatch = match.players.includes(player.name);
        if (!isPlayerInMatch) continue;
        
        totalMatches++;
        
        const winners = Array.isArray(match.winner) ? match.winner : [match.winner];
        const isPlayerWinner = winners.includes(player.name);
        
        if (isPlayerWinner) {
          totalPoints += 50; // +50 por vitória
          totalWins++;
          console.log(`  ✅ Vitória: +50 pontos (Total: ${totalPoints})`);
        } else {
          totalPoints = Math.max(1000, totalPoints - 20); // -20 por derrota, mínimo 1000
          console.log(`  ❌ Derrota: -20 pontos (Total: ${totalPoints})`);
        }
      }
      
      // Atualizar jogador no banco
      await sql`
        UPDATE players 
        SET rating = ${totalPoints}, wins = ${totalWins}, matches = ${totalMatches} 
        WHERE id = ${player.id}
      `;
      
      console.log(`📈 ${player.name}: ${totalMatches} partidas, ${totalWins} vitórias, ${totalPoints} pontos finais`);
    }
    
    console.log('\n✅ Recálculo concluído! Todos os jogadores foram atualizados.');
    
    // Mostrar estatísticas finais
    const finalStats = await sql`
      SELECT 
        name,
        rating as pontos,
        wins as vitorias,
        matches as partidas,
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
        END as divisao
      FROM players 
      ORDER BY rating DESC
    `;
    
    console.log('\n🏆 Ranking Final dos Jogadores:');
    console.log('='.repeat(80));
    finalStats.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name.padEnd(20)} | ${player.pontos.toString().padStart(4)} pts | ${player.divisao.padEnd(15)} | ${player.vitorias}/${player.partidas} (${player.partidas > 0 ? Math.round((player.vitorias/player.partidas)*100) : 0}%)`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante o recálculo:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  recalculatePlayerPoints().catch(console.error);
}

module.exports = { recalculatePlayerPoints };

const { neon } = require('@neondatabase/serverless');

// Verificar se a variável de ambiente está definida
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida nas variáveis de ambiente');
  process.exit(1);
}

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    // Testar conexão básica
    await sql`SELECT 1`;
    console.log('✅ Conexão com banco de dados estabelecida com sucesso');
    
    // Verificar se as tabelas existem
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('players', 'matches', 'match_participants', 'match_results')
      ORDER BY table_name
    `;
    
    if (tables.length === 4) {
      console.log('✅ Todas as tabelas necessárias estão presentes');
    } else {
      console.log('⚠️  Algumas tabelas estão faltando:', tables.map(t => t.table_name));
    }
    
    // Verificar se há jogadores
    const playerCount = await sql`SELECT COUNT(*) as count FROM players`;
    console.log(`👥 Total de jogadores: ${playerCount[0].count}`);
    
    // Verificar se há partidas
    const matchCount = await sql`SELECT COUNT(*) as count FROM matches`;
    console.log(`🎱 Total de partidas: ${matchCount[0].count}`);
    
    // Testar a função de estatísticas
    if (playerCount[0].count > 0) {
      const firstPlayer = await sql`SELECT id FROM players LIMIT 1`;
      if (firstPlayer.length > 0) {
        const stats = await sql`SELECT * FROM get_player_stats(${firstPlayer[0].id})`;
        console.log('✅ Função de estatísticas funcionando corretamente');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    return false;
  }
}

async function main() {
  console.log('🔍 Verificando conexão com banco de dados...');
  
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Banco de dados funcionando perfeitamente!');
      process.exit(0);
    } else {
      console.log('❌ Falha na conexão com banco de dados');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
  }
}

main();

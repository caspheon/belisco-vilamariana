const { neon } = require('@neondatabase/serverless');

// Verificar se a variável de ambiente está definida
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida nas variáveis de ambiente');
  process.exit(1);
}

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL);

async function resetDatabase() {
  console.log('🗑️  Resetando banco de dados Neon...');
  
  try {
    // Desabilitar verificações de foreign key temporariamente
    await sql`SET session_replication_role = replica`;
    
    // Remover todas as tabelas existentes (em ordem para evitar problemas de dependência)
    console.log('🗑️  Removendo tabelas existentes...');
    
    // Remover tabelas na ordem correta (filhas primeiro, depois pais)
    const tablesToDrop = [
      'match_results',
      'match_participants', 
      'matches',
      'players'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await sql`DROP TABLE IF EXISTS ${sql(table)} CASCADE`;
        console.log(`✅ Tabela ${table} removida`);
      } catch (error) {
        console.log(`⚠️  Erro ao remover tabela ${table}:`, error.message);
      }
    }
    
    // Remover funções customizadas
    console.log('🗑️  Removendo funções customizadas...');
    try {
      await sql`DROP FUNCTION IF EXISTS get_player_stats(INTEGER) CASCADE`;
      console.log('✅ Função get_player_stats removida');
    } catch (error) {
      console.log('⚠️  Erro ao remover função:', error.message);
    }
    
    // Remover índices (se ainda existirem)
    console.log('🗑️  Removendo índices...');
    const indexesToDrop = [
      'idx_players_name',
      'idx_matches_date',
      'idx_match_participants_match',
      'idx_match_participants_player',
      'idx_match_results_match',
      'idx_match_results_player'
    ];
    
    for (const index of indexesToDrop) {
      try {
        await sql`DROP INDEX IF EXISTS ${sql(index)}`;
        console.log(`✅ Índice ${index} removido`);
      } catch (error) {
        // Índices podem não existir, não é erro crítico
      }
    }
    
    // Reabilitar verificações de foreign key
    await sql`SET session_replication_role = DEFAULT`;
    
    console.log('✅ Banco de dados resetado com sucesso!');
    console.log('🔄 Todas as tabelas, dados e estruturas foram removidos.');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await resetDatabase();
    console.log('🎉 Reset do banco concluído!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { resetDatabase };

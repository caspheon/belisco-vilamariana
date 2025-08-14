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
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    throw error;
  }
}

async function setupDatabase() {
  console.log('🔧 Configurando banco de dados limpo...');
  
  try {
    // Schema simplificado para Sinu Cado Belisco
    const schema = `
    -- Schema simplificado para Sinu Cado Belisco
    -- Banco de dados: Neon PostgreSQL
    
    -- Tabela de Jogadores (apenas nome)
    CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Tabela de Partidas
    CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        match_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Tabela de Participantes das Partidas
    CREATE TABLE IF NOT EXISTS match_participants (
        id SERIAL PRIMARY KEY,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(match_id, player_id)
    );
    
    -- Tabela de Resultados das Partidas
    CREATE TABLE IF NOT EXISTS match_results (
        id SERIAL PRIMARY KEY,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        position INTEGER NOT NULL, -- 1º lugar = vencedor, 2º lugar = perdedor
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(match_id, player_id)
    );
    
    -- Índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
    CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
    CREATE INDEX IF NOT EXISTS idx_match_participants_match ON match_participants(match_id);
    CREATE INDEX IF NOT EXISTS idx_match_participants_player ON match_participants(player_id);
    CREATE INDEX IF NOT EXISTS idx_match_results_match ON match_results(match_id);
    CREATE INDEX IF NOT EXISTS idx_match_results_player ON match_results(player_id);
    
    -- Função para calcular estatísticas do jogador
    CREATE OR REPLACE FUNCTION get_player_stats(player_id_param INTEGER)
    RETURNS TABLE(
        total_matches BIGINT,
        total_wins BIGINT,
        total_losses BIGINT
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            COUNT(DISTINCT mr.match_id) as total_matches,
            COUNT(CASE WHEN mr.position = 1 THEN 1 END) as total_wins,
            COUNT(CASE WHEN mr.position > 1 THEN 1 END) as total_losses
        FROM match_results mr
        WHERE mr.player_id = player_id_param;
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Executar o schema
    await sql(schema);
    console.log('✅ Schema do banco criado com sucesso!');
    
    // Testar a conexão
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Conexão com banco de dados testada com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('players', 'matches', 'match_participants', 'match_results')
      ORDER BY table_name
    `;
    
    console.log('📋 Tabelas criadas:', tables.map(t => t.table_name).join(', '));
    
    // Verificar se há jogadores (deve estar vazio)
    const playerCount = await sql`SELECT COUNT(*) as count FROM players`;
    console.log(`👥 Total de jogadores: ${playerCount[0].count} (banco limpo)`);
    
    // Verificar se há partidas (deve estar vazio)
    const matchCount = await sql`SELECT COUNT(*) as count FROM matches`;
    console.log(`🎱 Total de partidas: ${matchCount[0].count} (banco limpo)`);
    
    console.log('🎉 Banco de dados limpo e configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    throw error;
  }
}

async function main() {
  console.log('🔄 Iniciando processo de reset completo do banco...');
  
  try {
    // 1. Resetar banco
    await resetDatabase();
    
    // 2. Configurar banco limpo
    await setupDatabase();
    
    console.log('🎉 Processo concluído com sucesso!');
    console.log('✨ Banco de dados Neon está limpo e pronto para uso.');
    
  } catch (error) {
    console.error('💥 Erro durante o processo:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { resetDatabase, setupDatabase };

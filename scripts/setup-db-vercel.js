// Carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

const { neon } = require('@neondatabase/serverless');

// Verificar se a variável de ambiente está definida
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida nas variáveis de ambiente');
  console.error('💡 Verifique se o arquivo .env existe e contém DATABASE_URL');
  process.exit(1);
}

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL);

// Comandos SQL separados
const commands = [
  // Tabela de Jogadores
  `CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Tabela de Partidas
  `CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    match_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Tabela de Participantes das Partidas
  `CREATE TABLE IF NOT EXISTS match_participants (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player_id)
  )`,
  
  // Tabela de Resultados das Partidas
  `CREATE TABLE IF NOT EXISTS match_results (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player_id)
  )`,
  
  // Índices
  `CREATE INDEX IF NOT EXISTS idx_players_name ON players(name)`,
  `CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date)`,
  `CREATE INDEX IF NOT EXISTS idx_match_participants_match ON match_participants(match_id)`,
  `CREATE INDEX IF NOT EXISTS idx_match_participants_player ON match_participants(player_id)`,
  `CREATE INDEX IF NOT EXISTS idx_match_results_match ON match_results(match_id)`,
  `CREATE INDEX IF NOT EXISTS idx_match_results_player ON match_results(player_id)`,
  
  // Função para calcular estatísticas do jogador
  `CREATE OR REPLACE FUNCTION get_player_stats(player_id_param INTEGER)
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
   $$ LANGUAGE plpgsql`
];

async function setupDatabase() {
  console.log('🔧 Configurando banco de dados para Vercel...');
  
  try {
    // Executar cada comando separadamente
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.log(`📝 Executando comando ${i + 1}/${commands.length}...`);
      await sql(command);
    }
    
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
    
    // Verificar se a função foi criada
    const functions = await sql`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'get_player_stats'
    `;
    
    if (functions.length > 0) {
      console.log('✅ Função get_player_stats criada com sucesso!');
    } else {
      console.log('⚠️ Função get_player_stats não foi criada');
    }
    
    console.log('🎉 Banco de dados configurado com sucesso!');
    console.log('🚀 Sistema pronto para uso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };

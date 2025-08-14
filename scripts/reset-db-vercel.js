require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function resetDatabase() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔄 Resetando banco de dados...');
    
    // 1. Remover TODAS as tabelas existentes (incluindo as antigas)
    console.log('📋 Removendo tabelas existentes...');
    
    // Tabelas antigas que não são mais usadas
    await sql`DROP TABLE IF EXISTS match_participants CASCADE`;
    await sql`DROP TABLE IF EXISTS match_results CASCADE`;
    await sql`DROP TABLE IF EXISTS player_stats CASCADE`;
    
    // Tabelas principais
    await sql`DROP TABLE IF EXISTS matches CASCADE`;
    await sql`DROP TABLE IF EXISTS players CASCADE`;
    
    // Funções e triggers
    await sql`DROP FUNCTION IF EXISTS update_player_stats CASCADE`;
    await sql`DROP FUNCTION IF EXISTS get_player_stats CASCADE`;
    
    console.log('✅ Tabelas antigas removidas com sucesso!');
    
    // 2. Criar tabela de jogadores
    console.log('👥 Criando tabela de jogadores...');
    await sql`
      CREATE TABLE players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        matches INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        rating INTEGER DEFAULT 1000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 3. Criar tabela de partidas
    console.log('🎱 Criando tabela de partidas...');
    await sql`
      CREATE TABLE matches (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'dupla')),
        players TEXT[] NOT NULL,
        winner TEXT[] NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // 4. Criar função para atualizar estatísticas
    console.log('⚡ Criando função de atualização de estatísticas...');
    await sql`
      CREATE OR REPLACE FUNCTION update_player_stats()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Atualizar estatísticas quando uma partida é criada
        IF TG_OP = 'INSERT' THEN
          -- Incrementar matches para todos os jogadores da partida
          UPDATE players 
          SET matches = matches + 1
          WHERE id::text = ANY(NEW.players);
          
          -- Incrementar wins para os vencedores
          UPDATE players 
          SET wins = wins + 1
          WHERE name = ANY(NEW.winner);
          
          -- Incrementar losses para os perdedores
          UPDATE players 
          SET losses = losses + 1
          WHERE id::text = ANY(NEW.players) AND name != ALL(NEW.winner);
          
          -- Atualizar rating para todos os jogadores da partida
          UPDATE players 
          SET rating = CASE 
            WHEN name = ANY(NEW.winner) THEN 
              GREATEST(1000, rating + 25 + (wins * 2))
            ELSE 
              GREATEST(1000, rating - 15 + (wins * 1))
          END
          WHERE id::text = ANY(NEW.players);
          
          RETURN NEW;
        END IF;
        
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql
    `;
    
    // 5. Criar trigger para executar a função automaticamente
    console.log('🔗 Criando trigger...');
    await sql`
      CREATE TRIGGER update_stats_trigger
        AFTER INSERT ON matches
        FOR EACH ROW
        EXECUTE FUNCTION update_player_stats()
    `;
    
    // 6. Criar índices para performance
    console.log('📊 Criando índices...');
    await sql`CREATE INDEX idx_players_rating ON players(rating DESC)`;
    await sql`CREATE INDEX idx_players_name ON players(name)`;
    await sql`CREATE INDEX idx_matches_date ON matches(date DESC)`;
    await sql`CREATE INDEX idx_matches_winner ON matches USING GIN(winner)`;
    
    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('');
    console.log('🎯 Estrutura limpa criada:');
    console.log('   - Tabela "players" com campos: id, name, matches, wins, losses, rating, created_at');
    console.log('   - Tabela "matches" com campos: id, type, players[], winner[], date');
    console.log('   - Função "update_player_stats()" para atualizar estatísticas automaticamente');
    console.log('   - Trigger para executar a função após cada inserção de partida');
    console.log('   - Índices para otimizar consultas');
    console.log('');
    console.log('🗑️ Tabelas antigas removidas:');
    console.log('   - match_participants (não mais necessária)');
    console.log('   - match_results (não mais necessária)');
    console.log('   - player_stats (não mais necessária)');
    console.log('');
    console.log('🚀 Agora você pode:');
    console.log('   1. Adicionar jogadores reais');
    console.log('   2. Criar partidas individuais (1v1) ou em dupla (2v2)');
    console.log('   3. Selecionar vencedores individuais ou duplas vencedoras');
    console.log('   4. Ver estatísticas atualizadas automaticamente');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase };

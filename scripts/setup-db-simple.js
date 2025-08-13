#!/usr/bin/env node

/**
 * Script simplificado para configurar o banco de dados Neon
 * Execute: node scripts/setup-db-simple.js
 */

// Carregar variáveis de ambiente
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Carregar .env
dotenv.config({ path: '.env' });

// Verificar se a variável de ambiente está definida
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está definida!');
  console.log('📝 Copie o arquivo env.example para .env e configure a variável');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('🚀 Configurando banco de dados Neon...');
    
    // Criar tabelas uma por uma
    console.log('📋 Criando tabela players...');
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `;
    
    console.log('📋 Criando tabela matches...');
    await sql`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        match_date DATE NOT NULL,
        match_time TIME,
        location VARCHAR(200),
        max_players INTEGER DEFAULT 4,
        min_players INTEGER DEFAULT 2,
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES players(id)
      )
    `;
    
    console.log('📋 Criando tabela match_participants...');
    await sql`
      CREATE TABLE IF NOT EXISTS match_participants (
        id SERIAL PRIMARY KEY,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_confirmed BOOLEAN DEFAULT false,
        UNIQUE(match_id, player_id)
      )
    `;
    
    console.log('📋 Criando tabela match_results...');
    await sql`
      CREATE TABLE IF NOT EXISTS match_results (
        id SERIAL PRIMARY KEY,
        match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        points INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(match_id, player_id)
      )
    `;
    
    console.log('📋 Criando tabela player_stats...');
    await sql`
      CREATE TABLE IF NOT EXISTS player_stats (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        total_matches INTEGER DEFAULT 0,
        total_wins INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        best_position INTEGER DEFAULT 999,
        average_position DECIMAL(4,2) DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(player_id)
      )
    `;
    
    // Criar índices
    console.log('📋 Criando índices...');
    await sql`CREATE INDEX IF NOT EXISTS idx_players_name ON players(name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_match_participants_match ON match_participants(match_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_match_participants_player ON match_participants(player_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_match_results_match ON match_results(match_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_match_results_player ON match_results(player_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id)`;
    
    // Inserir dados de exemplo
    console.log('📋 Inserindo dados de exemplo...');
    await sql`
      INSERT INTO players (name, email) VALUES 
        ('João Silva', 'joao@email.com'),
        ('Maria Santos', 'maria@email.com'),
        ('Pedro Costa', 'pedro@email.com'),
        ('Ana Oliveira', 'ana@email.com')
      ON CONFLICT (name) DO NOTHING
    `;
    
    console.log('✅ Banco de dados configurado com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📊 Tabelas no banco:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Verificar dados de exemplo
    const playerCount = await sql`SELECT COUNT(*) as count FROM players`;
    console.log(`\n👥 Jogadores de exemplo: ${playerCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error.message);
    process.exit(1);
  }
}

setupDatabase();

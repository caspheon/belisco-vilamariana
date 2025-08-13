#!/usr/bin/env node

/**
 * Script para resetar o banco de dados Neon
 * Execute: node scripts/reset-db.js
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

async function resetDatabase() {
  try {
    console.log('🔄 Resetando banco de dados Neon...');
    
    // Desabilitar triggers temporariamente
    await sql`SET session_replication_role = replica;`;
    
    // Remover todas as tabelas
    const tables = [
      'match_results',
      'match_participants', 
      'player_stats',
      'matches',
      'players'
    ];
    
    for (const table of tables) {
      console.log(`🗑️  Removendo tabela: ${table}`);
      await sql`DROP TABLE IF EXISTS ${sql(table)} CASCADE`;
    }
    
    // Remover funções
    console.log('🗑️  Removendo funções...');
    await sql`DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`;
    await sql`DROP FUNCTION IF EXISTS update_player_stats() CASCADE`;
    
    // Reabilitar triggers
    await sql`SET session_replication_role = DEFAULT;`;
    
    console.log('✅ Banco de dados resetado com sucesso!');
    console.log('💡 Execute "npm run db:setup" para recriar as tabelas');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error.message);
    process.exit(1);
  }
}

resetDatabase();

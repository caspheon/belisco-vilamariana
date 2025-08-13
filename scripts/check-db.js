#!/usr/bin/env node

/**
 * Script para verificar o estado do banco de dados Neon
 * Execute: node scripts/check-db.js
 */

// Carregar variáveis de ambiente
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Carregar .env
dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estado do banco de dados...');
    
    // Verificar jogadores
    const players = await sql`SELECT * FROM players`;
    console.log(`👥 Jogadores: ${players.length}`);
    
    // Verificar partidas
    const matches = await sql`SELECT * FROM matches`;
    console.log(`🎮 Partidas: ${matches.length}`);
    
    // Verificar estatísticas
    const stats = await sql`SELECT * FROM player_stats`;
    console.log(`📊 Estatísticas: ${stats.length}`);
    
    // Verificar tabelas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📋 Tabelas no banco:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    if (players.length > 0) {
      console.log('\n👤 Primeiro jogador:');
      console.log(`   Nome: ${players[0].name}`);
      console.log(`   Email: ${players[0].email || 'N/A'}`);
      console.log(`   ID: ${players[0].id}`);
    }
    
    if (matches.length > 0) {
      console.log('\n🎯 Primeira partida:');
      console.log(`   Título: ${matches[0].title}`);
      console.log(`   Data: ${matches[0].match_date}`);
      console.log(`   Status: ${matches[0].status}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error.message);
  }
}

checkDatabase();

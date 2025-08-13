#!/usr/bin/env node

/**
 * Script para configurar o banco de dados Neon
 * Execute: node scripts/setup-db.js
 */

// Carregar variáveis de ambiente
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// Carregar .env
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

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
    
    // Ler o arquivo de schema
    const schemaPath = join(__dirname, '..', 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Executar o schema - dividir em comandos individuais
    console.log('📋 Executando schema SQL...');
    
    // Dividir o schema em comandos individuais
    const commands = schema
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          await sql(command.trim());
        } catch (error) {
          // Ignorar erros de "already exists" para tabelas e funções
          if (!error.message.includes('already exists')) {
            console.log(`⚠️  Comando ignorado: ${command.substring(0, 50)}...`);
          }
        }
      }
    }
    
    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('🎯 Tabelas criadas:');
    console.log('   - players (jogadores)');
    console.log('   - matches (partidas)');
    console.log('   - match_participants (participantes)');
    console.log('   - match_results (resultados)');
    console.log('   - player_stats (estatísticas)');
    
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

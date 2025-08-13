#!/usr/bin/env node

/**
 * Script para inserir dados de exemplo no banco Neon
 * Execute: node scripts/seed-db.js
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

async function seedDatabase() {
  try {
    console.log('🌱 Inserindo dados de exemplo no banco Neon...');
    
    // Inserir jogadores de exemplo
    console.log('👥 Inserindo jogadores...');
    const players = await sql`
      INSERT INTO players (name, email, phone) VALUES 
        ('João Silva', 'joao@email.com', '(11) 99999-1111'),
        ('Maria Santos', 'maria@email.com', '(11) 99999-2222'),
        ('Pedro Costa', 'pedro@email.com', '(11) 99999-3333'),
        ('Ana Oliveira', 'ana@email.com', '(11) 99999-4444'),
        ('Carlos Ferreira', 'carlos@email.com', '(11) 99999-5555'),
        ('Lucia Pereira', 'lucia@email.com', '(11) 99999-6666')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name
    `;
    
    console.log(`✅ ${players.length} jogadores inseridos`);
    
    // Inserir partidas de exemplo
    console.log('🎮 Inserindo partidas...');
    const matches = await sql`
      INSERT INTO matches (title, match_date, match_time, location, max_players, min_players) VALUES 
        ('Partida da Tarde', CURRENT_DATE + INTERVAL '1 day', '14:00', 'Casa do João', 4, 2),
        ('Jogo da Noite', CURRENT_DATE + INTERVAL '2 days', '20:00', 'Casa da Maria', 4, 2),
        ('Partida do Fim de Semana', CURRENT_DATE + INTERVAL '5 days', '15:00', 'Casa do Pedro', 4, 2)
      RETURNING id, title, match_date
    `;
    
    console.log(`✅ ${matches.length} partidas inseridas`);
    
    // Adicionar participantes às partidas
    console.log('👥 Adicionando participantes...');
    for (const match of matches) {
      // Adicionar 3-4 jogadores aleatórios para cada partida
      const randomPlayers = players.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 2));
      
      for (const player of randomPlayers) {
        await sql`
          INSERT INTO match_participants (match_id, player_id, is_confirmed)
          VALUES (${match.id}, ${player.id}, true)
          ON CONFLICT (match_id, player_id) DO NOTHING
        `;
      }
    }
    
    console.log('✅ Participantes adicionados às partidas');
    
    // Simular algumas partidas completadas com resultados
    console.log('🏆 Inserindo resultados de partidas...');
    const completedMatches = await sql`
      INSERT INTO matches (title, match_date, match_time, location, max_players, min_players, status) VALUES 
        ('Partida de Ontem', CURRENT_DATE - INTERVAL '1 day', '16:00', 'Casa da Ana', 4, 2, 'completed'),
        ('Jogo da Semana Passada', CURRENT_DATE - INTERVAL '7 days', '19:00', 'Casa do Carlos', 4, 2, 'completed')
      RETURNING id, title
    `;
    
    for (const match of completedMatches) {
      const participants = await sql`
        SELECT player_id FROM match_participants WHERE match_id = ${match.id}
      `;
      
      // Simular resultados (posições 1º, 2º, 3º, 4º)
      for (let i = 0; i < participants.length; i++) {
        const position = i + 1;
        const points = Math.floor(Math.random() * 100) + 50; // 50-150 pontos
        const score = Math.floor(Math.random() * 1000) + 500; // 500-1500 score
        
        await sql`
          INSERT INTO match_results (match_id, player_id, position, points, score)
          VALUES (${match.id}, ${participants[i].player_id}, ${position}, ${points}, ${score})
        `;
      }
    }
    
    console.log('✅ Resultados de partidas inseridos');
    
    // Verificar estatísticas geradas automaticamente
    const statsCount = await sql`SELECT COUNT(*) as count FROM player_stats`;
    console.log(`📊 Estatísticas geradas para ${statsCount[0].count} jogadores`);
    
    console.log('\n🎉 Banco de dados populado com sucesso!');
    console.log('📋 Dados inseridos:');
    console.log(`   - ${players.length} jogadores`);
    console.log(`   - ${matches.length + completedMatches.length} partidas`);
    console.log(`   - ${statsCount[0].count} estatísticas de jogadores`);
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error.message);
    process.exit(1);
  }
}

seedDatabase();

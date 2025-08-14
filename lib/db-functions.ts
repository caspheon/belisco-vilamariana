const { sql } = require('./db.js');
import type { 
  Player, 
  Match, 
  MatchResult, 
  CreatePlayer, 
  CreateMatch 
} from './types';

// ===== FUNÇÕES DE JOGADORES =====

export async function getAllPlayers(): Promise<Player[]> {
  return await sql`
    SELECT 
      id,
      name,
      created_at
    FROM players
    ORDER BY name
  `;
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const result = await sql`
    SELECT 
      p.id,
      p.name,
      COALESCE(stats.total_matches, 0) as matches,
      COALESCE(stats.total_wins, 0) as wins,
      COALESCE(stats.total_losses, 0) as losses
    FROM players p
    LEFT JOIN LATERAL get_player_stats(p.id) stats ON true
    WHERE p.id = ${id}
  `;
  
  if (result.length === 0) return null;
  
  const player = result[0];
  return {
    ...player,
    rating: calculateRating(player.wins, player.matches)
  };
}

export async function createPlayer(player: CreatePlayer): Promise<Player> {
  const result = await sql`
    INSERT INTO players (name)
    VALUES (${player.name})
    RETURNING id, name, created_at
  `;
  
  return result[0];
}

// ===== FUNÇÕES DE PARTIDAS =====

export async function getAllMatches(): Promise<Match[]> {
  return await sql`
    SELECT 
      m.id,
      m.title,
      m.match_date,
      m.created_at
    FROM matches m
    ORDER BY m.match_date DESC, m.created_at DESC
  `;
}

export async function createMatch(match: CreateMatch): Promise<Match> {
  // Inserir a partida
  const matchResult = await sql`
    INSERT INTO matches (title, match_date)
    VALUES (${match.title}, CURRENT_DATE)
    RETURNING id, title, match_date, created_at
  `;
  
  const newMatch = matchResult[0];
  
  // Inserir participantes
  await sql`
    INSERT INTO match_participants (match_id, player_id)
    VALUES (${newMatch.id}, ${match.player1Id})
  `;
  
  await sql`
    INSERT INTO match_participants (match_id, player_id)
    VALUES (${newMatch.id}, ${match.player2Id})
  `;
  
  // Inserir resultados (player1Id vence = posição 1, player2Id perde = posição 2)
  await sql`
    INSERT INTO match_results (match_id, player_id, position)
    VALUES 
      (${newMatch.id}, ${match.player1Id}, 1),
      (${newMatch.id}, ${match.player2Id}, 2)
  `;
  
  return newMatch;
}

// ===== FUNÇÕES DE ESTATÍSTICAS =====

export async function getRanking(): Promise<Player[]> {
  const players = await sql`
    SELECT 
      p.id,
      p.name,
      p.created_at,
      COALESCE(stats.total_matches, 0) as matches,
      COALESCE(stats.total_wins, 0) as wins,
      COALESCE(stats.total_losses, 0) as losses
    FROM players p
    LEFT JOIN LATERAL get_player_stats(p.id) stats ON true
    ORDER BY 
      COALESCE(stats.total_wins, 0) DESC,
      COALESCE(stats.total_matches, 0) DESC,
      p.name ASC
  `;
  
  return players.map((player: any) => ({
    id: player.id,
    name: player.name,
    created_at: player.created_at,
    matches: player.matches || 0,
    wins: player.wins || 0,
    losses: player.losses || 0,
    rating: calculateRating(player.wins || 0, player.matches || 0)
  }));
}

// ===== FUNÇÕES AUXILIARES =====

function calculateRating(wins: number, matches: number): number {
  if (matches === 0) return 1000;
  const winRate = wins / matches;
  return Math.round(1000 + (winRate - 0.5) * 400 + wins * 10);
}

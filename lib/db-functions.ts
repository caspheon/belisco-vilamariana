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
  const players = await sql`
    SELECT 
      p.id,
      p.name,
      COALESCE(stats.total_matches, 0) as matches,
      COALESCE(stats.total_wins, 0) as wins,
      COALESCE(stats.total_losses, 0) as losses
    FROM players p
    LEFT JOIN LATERAL get_player_stats(p.id) stats ON true
    ORDER BY p.name
  `;
  
  return players.map((player: any) => ({
    ...player,
    rating: calculateRating(player.wins, player.matches)
  }));
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
    RETURNING id, name
  `;
  
  return {
    ...result[0],
    matches: 0,
    wins: 0,
    losses: 0,
    rating: 1000
  };
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
  for (const playerId of match.players) {
    await sql`
      INSERT INTO match_participants (match_id, player_id)
      VALUES (${newMatch.id}, ${playerId})
    `;
  }
  
  // Inserir resultados (vencedor = posição 1, perdedor = posição 2)
  const winnerId = match.winner;
  const loserId = match.players.find(id => id !== winnerId);
  
  if (loserId) {
    await sql`
      INSERT INTO match_results (match_id, player_id, position)
      VALUES 
        (${newMatch.id}, ${winnerId}, 1),
        (${newMatch.id}, ${loserId}, 2)
    `;
  }
  
  return newMatch;
}

// ===== FUNÇÕES DE ESTATÍSTICAS =====

export async function getRanking(): Promise<Player[]> {
  const players = await sql`
    SELECT 
      p.id,
      p.name,
      COALESCE(stats.total_matches, 0) as matches,
      COALESCE(stats.total_wins, 0) as wins,
      COALESCE(stats.total_losses, 0) as losses
    FROM players p
    LEFT JOIN LATERAL get_player_stats(p.id) stats ON true
    WHERE COALESCE(stats.total_matches, 0) > 0
    ORDER BY 
      COALESCE(stats.total_wins, 0) DESC,
      COALESCE(stats.total_matches, 0) DESC,
      p.name ASC
  `;
  
  return players.map((player: any) => ({
    ...player,
    rating: calculateRating(player.wins, player.matches)
  }));
}

// ===== FUNÇÕES AUXILIARES =====

function calculateRating(wins: number, matches: number): number {
  if (matches === 0) return 1000;
  const winRate = wins / matches;
  return Math.round(1000 + (winRate - 0.5) * 400 + wins * 10);
}

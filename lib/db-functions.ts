const { sql } = require('./db.js');
import type { 
  Player, 
  Match, 
  MatchResult, 
  PlayerStats, 
  CreatePlayer, 
  CreateMatch, 
  CreateMatchResult,
  RankingEntry 
} from './types';

// ===== FUNÇÕES DE JOGADORES =====

export async function getAllPlayers(): Promise<Player[]> {
  return await sql`
    SELECT * FROM players 
    WHERE is_active = true 
    ORDER BY name
  `;
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const result = await sql`
    SELECT * FROM players 
    WHERE id = ${id} AND is_active = true
  `;
  return result[0] || null;
}

export async function createPlayer(player: CreatePlayer): Promise<Player> {
  const result = await sql`
    INSERT INTO players (name, email, phone)
    VALUES (${player.name}, ${player.email}, ${player.phone})
    RETURNING *
  `;
  return result[0];
}

export async function updatePlayer(id: number, updates: Partial<CreatePlayer>): Promise<Player | null> {
  const result = await sql`
    UPDATE players 
    SET 
      name = COALESCE(${updates.name}, name),
      email = COALESCE(${updates.email}, email),
      phone = COALESCE(${updates.phone}, phone)
    WHERE id = ${id} AND is_active = true
    RETURNING *
  `;
  return result[0] || null;
}

export async function deletePlayer(id: number): Promise<boolean> {
  const result = await sql`
    UPDATE players 
    SET is_active = false 
    WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}

// ===== FUNÇÕES DE PARTIDAS =====

export async function getAllMatches(): Promise<Match[]> {
  return await sql`
    SELECT * FROM matches 
    ORDER BY match_date DESC, created_at DESC
  `;
}

export async function getMatchById(id: number): Promise<Match | null> {
  const result = await sql`
    SELECT * FROM matches 
    WHERE id = ${id}
  `;
  return result[0] || null;
}

export async function createMatch(match: CreateMatch): Promise<Match> {
  const result = await sql`
    INSERT INTO matches (title, match_date, match_time, location, max_players, min_players, created_by)
    VALUES (${match.title}, ${match.match_date}, ${match.match_time}, ${match.location}, ${match.max_players || 4}, ${match.min_players || 2}, ${match.created_by})
    RETURNING *
  `;
  return result[0];
}

export async function updateMatchStatus(id: number, status: Match['status']): Promise<Match | null> {
  const result = await sql`
    UPDATE matches 
    SET status = ${status}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

// ===== FUNÇÕES DE PARTICIPANTES =====

export async function addPlayerToMatch(matchId: number, playerId: number): Promise<boolean> {
  try {
    await sql`
      INSERT INTO match_participants (match_id, player_id)
      VALUES (${matchId}, ${playerId})
      ON CONFLICT (match_id, player_id) DO NOTHING
    `;
    return true;
  } catch {
    return false;
  }
}

export async function removePlayerFromMatch(matchId: number, playerId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM match_participants 
    WHERE match_id = ${matchId} AND player_id = ${playerId}
    RETURNING id
  `;
  return result.length > 0;
}

export async function getMatchParticipants(matchId: number) {
  return await sql`
    SELECT 
      mp.*,
      p.name as player_name,
      p.email as player_email
    FROM match_participants mp
    JOIN players p ON mp.player_id = p.id
    WHERE mp.match_id = ${matchId}
    ORDER BY mp.joined_at
  `;
}

// ===== FUNÇÕES DE RESULTADOS =====

export async function addMatchResult(result: CreateMatchResult): Promise<MatchResult | null> {
  try {
    const dbResult = await sql`
      INSERT INTO match_results (match_id, player_id, position, points, score)
      VALUES (${result.match_id}, ${result.player_id}, ${result.position}, ${result.points || 0}, ${result.score || 0})
      ON CONFLICT (match_id, player_id) 
      DO UPDATE SET 
        position = EXCLUDED.position,
        points = EXCLUDED.points,
        score = EXCLUDED.score
      RETURNING *
    `;
    return dbResult[0] || null;
  } catch {
    return null;
  }
}

export async function getMatchResults(matchId: number) {
  return await sql`
    SELECT 
      mr.*,
      p.name as player_name
    FROM match_results mr
    JOIN players p ON mr.player_id = p.id
    WHERE mr.match_id = ${matchId}
    ORDER BY mr.position
  `;
}

// ===== FUNÇÕES DE ESTATÍSTICAS =====

export async function getPlayerStats(playerId: number): Promise<PlayerStats | null> {
  const result = await sql`
    SELECT * FROM player_stats 
    WHERE player_id = ${playerId}
  `;
  return result[0] || null;
}

export async function getRanking(): Promise<RankingEntry[]> {
  return await sql`
    SELECT 
      ps.player_id,
      p.name as player_name,
      ps.total_matches,
      ps.total_wins,
      ps.total_points,
      ps.best_position,
      ps.average_position,
      ROW_NUMBER() OVER (ORDER BY ps.total_wins DESC, ps.total_points DESC, ps.average_position ASC) as rank
    FROM player_stats ps
    JOIN players p ON ps.player_id = p.id
    WHERE p.is_active = true
    ORDER BY ps.total_wins DESC, ps.total_points DESC, ps.average_position ASC
  `;
}

// ===== FUNÇÕES DE RELATÓRIOS =====

export async function getPlayerHistory(playerId: number) {
  return await sql`
    SELECT 
      m.title,
      m.match_date,
      mr.position,
      mr.points,
      mr.score
    FROM match_results mr
    JOIN matches m ON mr.match_id = m.id
    WHERE mr.player_id = ${playerId}
    ORDER BY m.match_date DESC
  `;
}

export async function getUpcomingMatches(): Promise<Match[]> {
  return await sql`
    SELECT * FROM matches 
    WHERE match_date >= CURRENT_DATE 
    AND status = 'scheduled'
    ORDER BY match_date ASC, match_time ASC
  `;
}

export async function getRecentMatches(limit: number = 10): Promise<Match[]> {
  return await sql`
    SELECT * FROM matches 
    WHERE status = 'completed'
    ORDER BY match_date DESC, created_at DESC
    LIMIT ${limit}
  `;
}

// Tipos para o banco de dados Neon

export interface Player {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Match {
  id: number;
  title: string;
  match_date: Date;
  match_time?: string;
  location?: string;
  max_players: number;
  min_players: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
  created_by?: number;
}

export interface MatchParticipant {
  id: number;
  match_id: number;
  player_id: number;
  joined_at: Date;
  is_confirmed: boolean;
}

export interface MatchResult {
  id: number;
  match_id: number;
  player_id: number;
  position: number;
  points: number;
  score: number;
  created_at: Date;
}

export interface PlayerStats {
  id: number;
  player_id: number;
  total_matches: number;
  total_wins: number;
  total_points: number;
  best_position: number;
  average_position: number;
  last_updated: Date;
}

// Tipos para criação/atualização
export interface CreatePlayer {
  name: string;
  email?: string;
  phone?: string;
}

export interface CreateMatch {
  title: string;
  match_date: Date;
  match_time?: string;
  location?: string;
  max_players?: number;
  min_players?: number;
  created_by?: number;
}

export interface CreateMatchResult {
  match_id: number;
  player_id: number;
  position: number;
  points?: number;
  score?: number;
}

// Tipos para queries complexas
export interface PlayerWithStats extends Player {
  stats?: PlayerStats;
}

export interface MatchWithParticipants extends Match {
  participants: MatchParticipant[];
  results?: MatchResult[];
}

export interface RankingEntry {
  player_id: number;
  player_name: string;
  total_matches: number;
  total_wins: number;
  total_points: number;
  best_position: number;
  average_position: number;
  rank: number;
}

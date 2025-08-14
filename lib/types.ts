// Tipos simplificados para Sinu Cado Belisco

export interface Player {
  id: number;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  rating: number;
}

export interface Match {
  id: number;
  title: string;
  match_date: string;
  created_at: string;
}

export interface CreatePlayer {
  name: string;
}

export interface CreateMatch {
  title: string;
  players: number[];
  winner: number;
}

export interface MatchResult {
  id: number;
  match_id: number;
  player_id: number;
  position: number;
  created_at: string;
}

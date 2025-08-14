// Tipos simplificados para Sinu Cado Belisco

export interface Player {
  id: number;
  name: string;
  created_at: string;
  // Campos opcionais para compatibilidade
  matches?: number;
  wins?: number;
  losses?: number;
  rating?: number;
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
  player1Id: number;
  player2Id: number;
}

export interface MatchResult {
  id: number;
  match_id: number;
  player_id: number;
  position: number;
  created_at: string;
}

// Tipos para o ranking
export interface RankingPlayer extends Player {
  total_matches: number;
  total_wins: number;
  total_losses: number;
  win_rate: number;
}

// Tipos para o Sinuquinha do Belisco
// Estrutura adaptada para o sistema de rating e estatísticas

export interface Player {
  id: number
  name: string
  matches: number
  wins: number
  losses: number
  rating: number
  created_at: string
}

export interface Match {
  id: number
  type: "individual" | "dupla"
  players: string[]
  winner: string | string[] // String para individual, array para dupla
  date: string
}

export interface CreatePlayer {
  name: string
}

export interface CreateMatch {
  type: "individual" | "dupla"
  players: string[]
  winner: string | string[] // String para individual, array para dupla
}

// Tipos para o ranking
export interface RankingPlayer extends Player {
  winRate: number
  position: number
}

// Tipos para estatísticas
export interface PlayerStats {
  totalMatches: number
  totalWins: number
  totalLosses: number
  winRate: number
  currentRating: number
  bestRating: number
}

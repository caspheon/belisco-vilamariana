import { neon } from '@neondatabase/serverless'

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL!)

// Tipos para o banco
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

// Funções do banco de dados

export async function createPlayer(player: CreatePlayer): Promise<Player> {
  try {
    const result = await sql`
      INSERT INTO players (name, matches, wins, losses, rating)
      VALUES (${player.name}, 0, 0, 0, 1000)
      RETURNING id, name, matches, wins, losses, rating, created_at
    `
    
    if (!result || result.length === 0) {
      throw new Error('Erro ao criar jogador')
    }
    
    return result[0] as Player
  } catch (error) {
    console.error('Erro ao criar jogador:', error)
    throw new Error('Erro ao criar jogador no banco de dados')
  }
}

export async function getAllPlayers(): Promise<Player[]> {
  try {
    const result = await sql`
      SELECT id, name, matches, wins, losses, rating, created_at
      FROM players
      ORDER BY rating DESC, wins DESC, name ASC
    `
    
    return result as Player[]
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error)
    throw new Error('Erro ao buscar jogadores do banco de dados')
  }
}

export async function createMatch(match: CreateMatch): Promise<Match> {
  try {
    // Converter winner para array se for string (individual)
    const winnerArray = Array.isArray(match.winner) ? match.winner : [match.winner]
    
    const result = await sql`
      INSERT INTO matches (type, players, winner)
      VALUES (${match.type}, ${match.players}, ${winnerArray})
      RETURNING id, type, players, winner, date
    `
    
    if (!result || result.length === 0) {
      throw new Error('Erro ao criar partida')
    }
    
    return result[0] as Match
  } catch (error) {
    console.error('Erro ao criar partida:', error)
    throw new Error('Erro ao criar partida no banco de dados')
  }
}

export async function getAllMatches(): Promise<Match[]> {
  try {
    const result = await sql`
      SELECT id, type, players, winner, date
      FROM matches
      ORDER BY date DESC
    `
    
    return result as Match[]
  } catch (error) {
    console.error('Erro ao buscar partidas:', error)
    throw new Error('Erro ao buscar partidas do banco de dados')
  }
}

export async function getRanking(): Promise<Player[]> {
  try {
    const result = await sql`
      SELECT id, name, matches, wins, losses, rating, created_at
      FROM players
      ORDER BY rating DESC, wins DESC, name ASC
    `
    
    return result as Player[]
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    throw new Error('Erro ao buscar ranking do banco de dados')
  }
}

export async function getPlayerStats(playerId: number): Promise<Player | null> {
  try {
    const result = await sql`
      SELECT id, name, matches, wins, losses, rating, created_at
      FROM players
      WHERE id = ${playerId}
    `
    
    if (!result || result.length === 0) {
      return null
    }
    
    return result[0] as Player
  } catch (error) {
    console.error('Erro ao buscar estatísticas do jogador:', error)
    throw new Error('Erro ao buscar estatísticas do jogador')
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    await sql`DROP TABLE IF EXISTS matches CASCADE`
    await sql`DROP TABLE IF EXISTS players CASCADE`
    await sql`DROP FUNCTION IF EXISTS update_player_stats CASCADE`
    
    console.log('Banco de dados resetado com sucesso!')
  } catch (error) {
    console.error('Erro ao resetar banco:', error)
    throw new Error('Erro ao resetar banco de dados')
  }
}

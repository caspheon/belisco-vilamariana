import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configuração do banco Neon
let sql = null

function getDatabase() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não está definida')
    }
    sql = neon(databaseUrl)
  }
  return sql
}

// Dados dos jogadores
const players = [
  { name: 'Guerra', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Pedro Meneguetti', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Wagnao', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Zenatti', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Mexicano', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Caccuri', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Seu Porra', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Predinho', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Random', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Dpetris', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Gui', rating: 1000, matches: 0, wins: 0, losses: 0 },
  { name: 'Turazza', rating: 1000, matches: 0, wins: 0, losses: 0 }
]

// Dados das partidas individuais
const individualMatches = [
  { players: ['Guerra', 'Pedro Meneguetti'], winner: ['Guerra'], score: [5, 1] },
  { players: ['Guerra', 'Wagnao'], winner: ['Guerra'], score: [3, 0] },
  { players: ['Pedro Meneguetti', 'Wagnao'], winner: ['Pedro Meneguetti', 'Wagnao'], score: [1, 1] },
  { players: ['Zenatti', 'Pedro Meneguetti'], winner: ['Zenatti'], score: [2, 1] },
  { players: ['Pedro Meneguetti', 'Mexicano'], winner: ['Pedro Meneguetti'], score: [1, 0] }
]

// Dados das partidas em dupla
const duplaMatches = [
  { players: ['Pedro Meneguetti', 'Zenatti', 'Mexicano', 'Wagnao'], winner: ['Pedro Meneguetti', 'Zenatti'], score: [1, 0] },
  { players: ['Pedro Meneguetti', 'Wagnao', 'Mexicano', 'Zenatti'], winner: ['Mexicano', 'Zenatti'], score: [0, 2] },
  { players: ['Pedro Meneguetti', 'Zenatti', 'Mexicano', 'Guerra'], winner: ['Pedro Meneguetti', 'Zenatti'], score: [2, 0] },
  { players: ['Guerra', 'Wagnao', 'Pedro Meneguetti', 'Zenatti'], winner: ['Guerra', 'Wagnao'], score: [1, 0] },
  { players: ['Guerra', 'Wagnao', 'Caccuri', 'Mexicano'], winner: ['Guerra', 'Wagnao'], score: [1, 0] },
  { players: ['Pedro Meneguetti', 'Seu Porra', 'Guerra', 'Wagnao'], winner: ['Pedro Meneguetti', 'Seu Porra'], score: [1, 0] },
  { players: ['Guerra', 'Pedro Meneguetti', 'Caccuri', 'Seu Porra'], winner: ['Guerra', 'Pedro Meneguetti'], score: [1, 0] },
  { players: ['Guerra', 'Wagnao', 'Pedro Meneguetti', 'Predinho'], winner: ['Guerra', 'Wagnao'], score: [1, 0] },
  { players: ['Guerra', 'Pedro Meneguetti', 'Wagnao', 'Random'], winner: ['Guerra', 'Pedro Meneguetti'], score: [2, 1] },
  { players: ['Dpetris', 'Pedro Meneguetti', 'Zenatti', 'Mexicano'], winner: ['Dpetris', 'Pedro Meneguetti', 'Zenatti', 'Mexicano'], score: [1, 1] },
  { players: ['Guerra', 'Pedro Meneguetti', 'Mexicano', 'Zenatti'], winner: ['Guerra', 'Pedro Meneguetti'], score: [1, 0] },
  { players: ['Guerra', 'Pedro Meneguetti', 'Dpetris', 'Random'], winner: ['Guerra', 'Pedro Meneguetti'], score: [1, 0] },
  { players: ['Guerra', 'Seu Porra', 'Dpetris', 'Gui'], winner: ['Guerra', 'Seu Porra'], score: [1, 0] },
  { players: ['Dpetris', 'Guerra', 'Turazza', 'Gui'], winner: ['Turazza', 'Gui'], score: [0, 1] },
  { players: ['Pedro Meneguetti', 'Guerra', 'Zenatti', 'Random'], winner: ['Pedro Meneguetti', 'Guerra'], score: [1, 0] }
]

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...')
    
    const sql = getDatabase()
    
    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...')
    await sql`DELETE FROM matches`
    await sql`DELETE FROM players`
    
    // Inserir jogadores
    console.log('👥 Inserindo jogadores...')
    for (const player of players) {
      const [newPlayer] = await sql`
        INSERT INTO players (name, matches, wins, losses, rating) 
        VALUES (${player.name}, ${player.matches}, ${player.wins}, ${player.losses}, ${player.rating}) 
        RETURNING id, name
      `
      console.log(`✅ Jogador inserido: ${newPlayer.name} (ID: ${newPlayer.id})`)
    }
    
    // Inserir partidas individuais
    console.log('🎱 Inserindo partidas individuais...')
    for (const match of individualMatches) {
      const [newMatch] = await sql`
        INSERT INTO matches (type, players, winner) 
        VALUES ('individual', ${match.players}, ${match.winner}) 
        RETURNING id, type, players, winner
      `
      console.log(`✅ Partida individual inserida: ${match.players.join(' vs ')} (ID: ${newMatch.id})`)
    }
    
    // Inserir partidas em dupla
    console.log('👥 Inserindo partidas em dupla...')
    for (const match of duplaMatches) {
      const [newMatch] = await sql`
        INSERT INTO matches (type, players, winner) 
        VALUES ('dupla', ${match.players}, ${match.winner}) 
        RETURNING id, type, players, winner
      `
      console.log(`✅ Partida em dupla inserida: ${match.players.slice(0, 2).join(' e ')} vs ${match.players.slice(2).join(' e ')} (ID: ${newMatch.id})`)
    }
    
    console.log('🎉 Seed concluído com sucesso!')
    console.log(`📊 Total de jogadores inseridos: ${players.length}`)
    console.log(`🎱 Total de partidas inseridas: ${individualMatches.length + duplaMatches.length}`)
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    process.exit(1)
  }
}

// Executar o seed
seedDatabase()

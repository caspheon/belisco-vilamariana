import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// Verificar se estamos em produção e se DATABASE_URL está definida
const isProduction = process.env.NODE_ENV === 'production'
const hasDatabaseUrl = !!process.env.DATABASE_URL

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL || 'dummy://url')

// GET - Listar todas as partidas
export async function GET() {
  // Se estamos em produção sem DATABASE_URL, retornar erro
  if (isProduction && !hasDatabaseUrl) {
    return NextResponse.json(
      { error: 'DATABASE_URL não configurada' },
      { status: 500 }
    )
  }

  try {
    const matches = await sql`
      SELECT id, title, match_date, created_at 
      FROM matches 
      ORDER BY match_date DESC, created_at DESC
    `
    
    return NextResponse.json(matches)
  } catch (error) {
    console.error('Erro ao buscar partidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova partida
export async function POST(request: NextRequest) {
  // Se estamos em produção sem DATABASE_URL, retornar erro
  if (isProduction && !hasDatabaseUrl) {
    return NextResponse.json(
      { error: 'DATABASE_URL não configurada' },
      { status: 500 }
    )
  }

  try {
    const { title, player1Id, player2Id } = await request.json()
    
    if (!title || !player1Id || !player2Id) {
      return NextResponse.json(
        { error: 'Título e IDs dos jogadores são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Criar a partida
    const [newMatch] = await sql`
      INSERT INTO matches (title, match_date) 
      VALUES (${title}, CURRENT_DATE) 
      RETURNING id, title, match_date, created_at
    `
    
    // Adicionar participantes
    await sql`
      INSERT INTO match_participants (match_id, player_id) 
      VALUES (${newMatch.id}, ${player1Id})
    `
    
    await sql`
      INSERT INTO match_participants (match_id, player_id) 
      VALUES (${newMatch.id}, ${player2Id})
    `
    
    // Adicionar resultados (player1 vence por padrão)
    await sql`
      INSERT INTO match_results (match_id, player_id, position) 
      VALUES (${newMatch.id}, ${player1Id}, 1)
    `
    
    await sql`
      INSERT INTO match_results (match_id, player_id, position) 
      VALUES (${newMatch.id}, ${player2Id}, 2)
    `
    
    return NextResponse.json(newMatch, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar partida:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

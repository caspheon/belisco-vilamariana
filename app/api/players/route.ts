import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// Verificar se estamos em produção e se DATABASE_URL está definida
const isProduction = process.env.NODE_ENV === 'production'
const hasDatabaseUrl = !!process.env.DATABASE_URL

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL || 'dummy://url')

// GET - Listar todos os jogadores
export async function GET() {
  // Se estamos em produção sem DATABASE_URL, retornar erro
  if (isProduction && !hasDatabaseUrl) {
    return NextResponse.json(
      { error: 'DATABASE_URL não configurada' },
      { status: 500 }
    )
  }

  try {
    const players = await sql`
      SELECT id, name, created_at 
      FROM players 
      ORDER BY name
    `
    
    return NextResponse.json(players)
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo jogador
export async function POST(request: NextRequest) {
  // Se estamos em produção sem DATABASE_URL, retornar erro
  if (isProduction && !hasDatabaseUrl) {
    return NextResponse.json(
      { error: 'DATABASE_URL não configurada' },
      { status: 500 }
    )
  }

  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }
    
    const [newPlayer] = await sql`
      INSERT INTO players (name) 
      VALUES (${name.trim()}) 
      RETURNING id, name, created_at
    `
    
    return NextResponse.json(newPlayer, { status: 201 })
  } catch (error: any) {
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Jogador com este nome já existe' },
        { status: 400 }
      )
    }
    
    console.error('Erro ao criar jogador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

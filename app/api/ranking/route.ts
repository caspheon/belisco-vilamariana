import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// Verificar se estamos em produção e se DATABASE_URL está definida
const isProduction = process.env.NODE_ENV === 'production'
const hasDatabaseUrl = !!process.env.DATABASE_URL

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL || 'dummy://url')

// GET - Buscar ranking dos jogadores
export async function GET() {
  // Se estamos em produção sem DATABASE_URL, retornar erro
  if (isProduction && !hasDatabaseUrl) {
    return NextResponse.json(
      { error: 'DATABASE_URL não configurada' },
      { status: 500 }
    )
  }

  try {
    const ranking = await sql`
      SELECT 
        p.id,
        p.name,
        p.created_at,
        COALESCE(stats.total_matches, 0) as total_matches,
        COALESCE(stats.total_wins, 0) as total_wins,
        COALESCE(stats.total_losses, 0) as total_losses,
        CASE 
          WHEN COALESCE(stats.total_matches, 0) = 0 THEN 0
          ELSE ROUND((COALESCE(stats.total_wins, 0)::DECIMAL / COALESCE(stats.total_matches, 1)::DECIMAL) * 100, 1)
        END as win_rate
      FROM players p
      LEFT JOIN LATERAL (
        SELECT * FROM get_player_stats(p.id)
      ) stats ON true
      ORDER BY 
        COALESCE(stats.total_wins, 0) DESC,
        COALESCE(stats.total_matches, 0) DESC,
        p.name ASC
    `
    
    return NextResponse.json(ranking)
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

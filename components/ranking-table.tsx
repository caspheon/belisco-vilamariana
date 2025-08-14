"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Trophy, Medal, Target, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"
import type { RankingPlayer } from "../lib/types"

interface RankingTableProps {
  onRefresh: () => void
}

export function RankingTable({ onRefresh }: RankingTableProps) {
  const [ranking, setRanking] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRanking = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/ranking')
      if (!response.ok) {
        throw new Error('Erro ao carregar ranking')
      }
      
      const data = await response.json()
      setRanking(data)
    } catch (err) {
      console.error('Erro ao carregar ranking:', err)
      setError('Erro ao carregar ranking')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRanking()
  }, [])

  const handleRefresh = async () => {
    await loadRanking()
    onRefresh()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking dos Jogadores
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ranking...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking dos Jogadores
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <Button onClick={handleRefresh} variant="outline">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (ranking.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking dos Jogadores
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Nenhum jogador encontrado</p>
          <p className="text-sm text-gray-500">
            Adicione jogadores e crie partidas para ver o ranking
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking dos Jogadores
          </CardTitle>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ranking.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Posição */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm">
                  {index === 0 && (
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  )}
                  {index === 1 && (
                    <Medal className="w-5 h-5 text-gray-400" />
                  )}
                  {index === 2 && (
                    <Medal className="w-5 h-5 text-amber-600" />
                  )}
                  {index > 2 && (
                    <span className="bg-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Nome do jogador */}
                <div>
                  <h3 className="font-semibold text-gray-900">{player.name}</h3>
                  <p className="text-sm text-gray-500">
                    Jogador desde {new Date(player.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {player.total_wins}
                  </div>
                  <div className="text-xs text-gray-500">Vitórias</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {player.total_losses}
                  </div>
                  <div className="text-xs text-gray-500">Derrotas</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {player.total_matches}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {player.win_rate}%
                  </div>
                  <div className="text-xs text-gray-500">Taxa</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">📊 Resumo do Ranking</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-600 font-medium">Total de Jogadores:</span>
              <span className="ml-2 text-gray-700">{ranking.length}</span>
            </div>
            <div>
              <span className="text-green-600 font-medium">Total de Partidas:</span>
              <span className="ml-2 text-gray-700">
                {ranking.reduce((sum, p) => sum + p.total_matches, 0)}
              </span>
            </div>
            <div>
              <span className="text-green-600 font-medium">Líder:</span>
              <span className="ml-2 text-gray-700">
                {ranking[0]?.name || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-green-600 font-medium">Última Atualização:</span>
              <span className="ml-2 text-gray-700">
                {new Date().toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

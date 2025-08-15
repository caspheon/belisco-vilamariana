"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Trophy, Medal, Award, TrendingUp, Users, User } from "lucide-react"
import type { Player, Match } from "../lib/types"

interface RankingTableProps {
  players: Player[]
  matches: Match[]
}

export function RankingTable({ players, matches }: RankingTableProps) {
  // Função para calcular vitórias por tipo de partida
  const calculateVictoriesByType = (playerName: string) => {
    let individualWins = 0
    let duplaWins = 0

    matches.forEach(match => {
      if (!match.players || !match.winner) return

      const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
      const isPlayerWinner = winners.includes(playerName)
      
      if (isPlayerWinner) {
        if (match.type === 'individual') {
          individualWins++
        } else if (match.type === 'dupla') {
          duplaWins++
        }
      }
    })

    return { individualWins, duplaWins }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by rating first, then by win rate, then by total wins
    if (b.rating !== a.rating) return b.rating - a.rating

    const aWinRate = a.matches > 0 ? a.wins / a.matches : 0
    const bWinRate = b.matches > 0 ? b.wins / a.matches : 0

    if (bWinRate !== aWinRate) return bWinRate - aWinRate

    return b.wins - a.wins
  })

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400 drop-shadow-sm" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-300 drop-shadow-sm" />
      case 3:
        return <Award className="h-5 w-5 text-amber-500 drop-shadow-sm" />
      default:
        return (
          <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-gray-300 bg-gray-600/50 rounded-full">
            {position}
          </span>
        )
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 1200) return "bg-yellow-600/90 text-yellow-100 shadow-md"
    if (rating >= 1100) return "bg-green-600/90 text-green-100 shadow-md"
    if (rating >= 1000) return "bg-blue-600/90 text-blue-100 shadow-md"
    return "bg-gray-600/90 text-gray-100 shadow-md"
  }

  if (players.length === 0) {
    return (
      <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl">
        <CardContent className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
          <p className="text-gray-200">Nenhum jogador cadastrado ainda.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400 drop-shadow-sm">
            <Trophy className="h-5 w-5 text-green-400" />🏆 Ranking de Jogadores
          </CardTitle>
          <CardDescription className="text-gray-200">
            Classificação baseada no rating e desempenho nas partidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const position = index + 1
              const winRate = player.matches > 0 ? (player.wins / player.matches) * 100 : 0
              const { individualWins, duplaWins } = calculateVictoriesByType(player.name)

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    position <= 3
                      ? "bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-yellow-500/50 shadow-lg"
                      : "bg-gradient-to-r from-gray-700/60 to-gray-800/60 border-gray-600/50 hover:border-green-400/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-700/50 rounded-full">
                        {getRankIcon(position)}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg text-green-400 drop-shadow-sm">{player.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-200">
                          <span>{player.matches} partidas</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-green-400 font-medium">{player.wins}V</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-red-400 font-medium">{player.losses}D</span>
                        </div>
                        {/* Nova linha com vitórias por tipo */}
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <div className="flex items-center gap-1 text-blue-400">
                            <User className="h-3 w-3" />
                            <span>{individualWins} individual</span>
                          </div>
                          <div className="flex items-center gap-1 text-purple-400">
                            <Users className="h-3 w-3" />
                            <span>{duplaWins} dupla</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <Badge className={getRatingColor(player.rating)}>{player.rating} pts</Badge>
                      <div className="text-sm text-gray-200 font-medium">{winRate.toFixed(1)}% vitórias</div>
                    </div>
                  </div>

                  {/* Progress bar for win rate */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-300 mb-2">
                      <span className="font-medium">Taxa de vitória</span>
                      <span className="font-bold">{winRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-600/70 rounded-full h-2.5 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${Math.min(winRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Matches */}
      {matches.length > 0 && (
        <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400 drop-shadow-sm">
              <TrendingUp className="h-5 w-5 text-green-400" />📊 Partidas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matches
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ordenar por data mais recente primeiro
                .slice(0, 5) // Limitar para apenas as 5 partidas mais recentes
                .map((match) => {
                  // Verificação de segurança para match.players
                  if (!match.players || !Array.isArray(match.players)) {
                    return null
                  }

                  // Verificação de segurança para match.winner
                  if (!match.winner) {
                    return null
                  }

                  // Converter winner para array se for string
                  const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
                  
                  // Formatar data e hora - ajustar fuso horário (-3 horas para Brasília)
                  const matchDate = new Date(match.date)
                  
                  // Ajustar para fuso horário brasileiro (UTC-3, subtrair 3 horas)
                  const adjustedDate = new Date(matchDate.getTime() - (3 * 60 * 60 * 1000))
                  
                  const formattedDate = adjustedDate.toLocaleDateString("pt-BR", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
                  
                  const formattedTime = adjustedDate.toLocaleTimeString("pt-BR", {
                    hour: '2-digit',
                    minute: '2-digit'
                  })

                  return (
                    <div
                      key={match.id}
                      className="p-4 border border-gray-600/50 rounded-lg bg-gradient-to-r from-gray-700/50 to-slate-700/50 hover:from-gray-600/50 hover:to-slate-600/50 transition-all duration-300 hover:shadow-md hover:border-green-400/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="border-green-400/70 text-green-400 bg-green-400/10 shadow-sm"
                            >
                              {match.type === "individual" ? "Individual" : "Dupla"}
                            </Badge>
                            <div className="flex flex-col text-xs">
                              <span className="text-gray-300 font-medium">
                                📅 {formattedDate}
                              </span>
                              <span className="text-gray-400">
                                🕐 {formattedTime}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-green-400 drop-shadow-sm">
                              {match.type === "individual" 
                                ? winners[0] 
                                : `${winners[0]} e ${winners[1]}`
                              }
                            </span>
                            <span className="text-gray-200"> {match.type === "individual" ? "venceu" : "venceram"} contra </span>
                            <span className="text-gray-100 font-medium">
                              {(() => {
                                const losers = match.players
                                  .filter((playerName) => !winners.includes(playerName))
                                
                                if (losers.length === 0) return ""
                                if (losers.length === 1) return losers[0]
                                if (losers.length === 2) return `${losers[0]} e ${losers[1]}`
                                return `${losers.slice(0, -1).join(", ")} e ${losers[losers.length - 1]}`
                              })()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Trophy className="h-5 w-5 text-yellow-400 drop-shadow-sm mb-2" />
                          <div className="text-xs text-gray-400 text-center">
                            Partida #{match.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
                .filter(Boolean)} {/* Remove itens null */}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

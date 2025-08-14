"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Trophy, Medal, Award, TrendingUp } from "lucide-react"
import type { Player, Match } from "../../lib/types"

interface RankingTableProps {
  players: Player[]
  matches: Match[]
}

export function RankingTable({ players, matches }: RankingTableProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by rating first, then by win rate, then by total wins
    if (b.rating !== a.rating) return b.rating - a.rating

    const aWinRate = a.matches > 0 ? a.wins / a.matches : 0
    const bWinRate = b.matches > 0 ? b.wins / b.matches : 0

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
                .slice(-5)
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
                  const winnerPlayers = winners.map(winnerName => 
                    players.find(p => p.name === winnerName)
                  ).filter(Boolean)
                  
                  const matchPlayers = match.players
                    .map((id) => players.find((p) => p.id.toString() === id))
                    .filter(Boolean)

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
                            <span className="text-sm text-gray-300 font-medium">
                              {new Date(match.date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-green-400 drop-shadow-sm">
                              {match.type === "individual" 
                                ? winnerPlayers[0]?.name 
                                : `${winnerPlayers[0]?.name} e ${winnerPlayers[1]?.name}`
                              }
                            </span>
                            <span className="text-gray-200"> {match.type === "individual" ? "venceu" : "venceram"} contra </span>
                            <span className="text-gray-100 font-medium">
                              {matchPlayers
                                .filter((p) => !winners.includes(p?.name || ""))
                                .map((p) => p?.name)
                                .join(", ")}
                            </span>
                          </div>
                        </div>
                        <Trophy className="h-5 w-5 text-yellow-400 drop-shadow-sm" />
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

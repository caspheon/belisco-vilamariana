"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { GamepadIcon, User, Trophy } from "lucide-react"
import type { Player, CreateMatch } from "@/lib/types"

interface MatchCreatorProps {
  players: Player[]
  onAddMatch: (match: Omit<CreateMatch, "title">) => void
}

export function MatchCreator({ players, onAddMatch }: MatchCreatorProps) {
  const [player1, setPlayer1] = useState<string>("")
  const [player2, setPlayer2] = useState<string>("")
  const [winner, setWinner] = useState<string>("")

  const handleCreateMatch = () => {
    if (player1 && player2 && winner && (winner === player1 || winner === player2)) {
      onAddMatch({
        players: [parseInt(player1), parseInt(player2)],
        winner: parseInt(winner),
      })

      // Reset form
      setPlayer1("")
      setPlayer2("")
      setWinner("")
    }
  }

  const canCreateMatch = player1 && player2 && winner && (winner === player1 || winner === player2)

  if (players.length < 2) {
    return (
      <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl">
        <CardContent className="text-center py-8">
          <GamepadIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
          <p className="text-gray-200">Você precisa de pelo menos 2 jogadores cadastrados para criar uma partida.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400 drop-shadow-sm">
            <GamepadIcon className="h-5 w-5 text-green-400" />🎱 Nova Partida Individual (1v1)
          </CardTitle>
          <CardDescription className="text-gray-200">Configure uma nova partida de sinuca entre dois jogadores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-green-400 drop-shadow-sm">
                <User className="h-4 w-4 inline mr-2" />Jogador 1
              </Label>
              <Select
                value={player1}
                onValueChange={(value) => {
                  setPlayer1(value)
                  if (winner === value) setWinner("")
                }}
              >
                <SelectTrigger className="bg-gray-700/90 border-gray-500 text-white hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200 shadow-inner">
                  <SelectValue placeholder="Selecione o jogador 1" className="text-gray-300" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700/95 border-gray-600 shadow-xl backdrop-blur-sm">
                  {players
                    .filter((player) => player.id.toString() !== player2)
                    .map((player) => (
                      <SelectItem
                        key={player.id}
                        value={player.id.toString()}
                        className="text-white hover:bg-gray-600/80 focus:bg-gray-600/80 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{player.name}</span>
                          <Badge
                            variant="outline"
                            className="ml-2 border-green-400/70 text-green-400 bg-green-400/10"
                          >
                            {player.rating}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Player 2 */}
            <div className="space-y-3">
              <Label className="text-base font-medium text-green-400 drop-shadow-sm">
                <User className="h-4 w-4 inline mr-2" />Jogador 2
              </Label>
              <Select
                value={player2}
                onValueChange={(value) => {
                  setPlayer2(value)
                  if (winner === value) setWinner("")
                }}
              >
                <SelectTrigger className="bg-gray-700/90 border-gray-500 text-white hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200 shadow-inner">
                  <SelectValue placeholder="Selecione o jogador 2" className="text-gray-300" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700/95 border-gray-600 shadow-xl backdrop-blur-sm">
                  {players
                    .filter((player) => player.id.toString() !== player1)
                    .map((player) => (
                      <SelectItem
                        key={player.id}
                        value={player.id.toString()}
                        className="text-white hover:bg-gray-600/80 focus:bg-gray-600/80 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{player.name}</span>
                          <Badge
                            variant="outline"
                            className="ml-2 border-green-400/70 text-green-400 bg-green-400/10"
                          >
                            {player.rating}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Winner Selection */}
          {player1 && player2 && (
            <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
              <Label className="text-base font-medium flex items-center gap-2 text-green-400 drop-shadow-sm">
                <Trophy className="h-4 w-4 text-yellow-400" />🏆 Vencedor da Partida
              </Label>
              <Select value={winner} onValueChange={setWinner}>
                <SelectTrigger className="bg-gray-700/90 border-gray-500 text-white hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200 shadow-inner">
                  <SelectValue placeholder="Selecione o vencedor" className="text-gray-300" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700/95 border-gray-600 shadow-xl backdrop-blur-sm">
                  {[player1, player2].map((playerId) => {
                    const player = players.find((p) => p.id.toString() === playerId)
                    return player ? (
                      <SelectItem
                        key={player.id}
                        value={playerId}
                        className="text-white hover:bg-gray-600/80 focus:bg-gray-600/80 transition-colors duration-150"
                      >
                        {player.name}
                      </SelectItem>
                    ) : null
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Create Match Button */}
          <Button
            onClick={handleCreateMatch}
            disabled={!canCreateMatch}
            className="w-full bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-6"
            size="lg"
          >
            <Trophy className="h-5 w-5 mr-2" />🎯 Registrar Partida
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { GamepadIcon, Users, User, Trophy } from "lucide-react"
import type { Player, Match } from "@/app/page"

interface MatchCreatorProps {
  players: Player[]
  onAddMatch: (match: Omit<Match, "id" | "date">) => void
}

export function MatchCreator({ players, onAddMatch }: MatchCreatorProps) {
  const [matchType, setMatchType] = useState<"individual" | "dupla">("individual")
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [winner, setWinner] = useState<string>("")

  const handlePlayerSelect = (playerId: string, position: number) => {
    const newSelectedPlayers = [...selectedPlayers]
    newSelectedPlayers[position] = playerId
    setSelectedPlayers(newSelectedPlayers)

    // Reset winner if they're no longer in the match
    if (winner && !newSelectedPlayers.includes(winner)) {
      setWinner("")
    }
  }

  const handleCreateMatch = () => {
    if (selectedPlayers.length === (matchType === "individual" ? 2 : 4) && winner) {
      onAddMatch({
        type: matchType,
        players: selectedPlayers,
        winner,
      })

      // Reset form
      setSelectedPlayers([])
      setWinner("")
    }
  }

  const requiredPlayers = matchType === "individual" ? 2 : 4
  const canCreateMatch = selectedPlayers.length === requiredPlayers && winner && selectedPlayers.includes(winner)

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
            <GamepadIcon className="h-5 w-5 text-green-400" />🎱 Nova Partida
          </CardTitle>
          <CardDescription className="text-gray-200">Configure uma nova partida de sinuca</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-green-400 drop-shadow-sm">Tipo de Partida</Label>
            <RadioGroup
              value={matchType}
              onValueChange={(value) => {
                setMatchType(value as "individual" | "dupla")
                setSelectedPlayers([])
                setWinner("")
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 transition-all duration-200">
                <RadioGroupItem value="individual" id="individual" className="border-green-400 text-green-400" />
                <Label htmlFor="individual" className="flex items-center gap-2 text-gray-100 cursor-pointer">
                  <User className="h-4 w-4" />
                  Individual (1v1)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 transition-all duration-200">
                <RadioGroupItem value="dupla" id="dupla" className="border-green-400 text-green-400" />
                <Label htmlFor="dupla" className="flex items-center gap-2 text-gray-100 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Dupla (2v2)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Player Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-green-400 drop-shadow-sm">
              Selecionar Jogadores ({selectedPlayers.filter(Boolean).length}/{requiredPlayers})
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: requiredPlayers }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm text-gray-100 font-medium">
                    {matchType === "individual"
                      ? `Jogador ${index + 1}`
                      : `${index < 2 ? "Dupla A" : "Dupla B"} - Jogador ${(index % 2) + 1}`}
                  </Label>
                  <Select
                    value={selectedPlayers[index] || ""}
                    onValueChange={(value) => handlePlayerSelect(value, index)}
                  >
                    <SelectTrigger className="bg-gray-700/90 border-gray-500 text-white hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200 shadow-inner">
                      <SelectValue placeholder="Selecione um jogador" className="text-gray-300" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700/95 border-gray-600 shadow-xl backdrop-blur-sm">
                      {players
                        .filter(
                          (player) => !selectedPlayers.includes(player.id) || selectedPlayers[index] === player.id,
                        )
                        .map((player) => (
                          <SelectItem
                            key={player.id}
                            value={player.id}
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
              ))}
            </div>
          </div>

          {/* Winner Selection */}
          {selectedPlayers.filter(Boolean).length === requiredPlayers && (
            <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
              <Label className="text-base font-medium flex items-center gap-2 text-green-400 drop-shadow-sm">
                <Trophy className="h-4 w-4 text-yellow-400" />🏆 Vencedor da Partida
              </Label>
              <Select value={winner} onValueChange={setWinner}>
                <SelectTrigger className="bg-gray-700/90 border-gray-500 text-white hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200 shadow-inner">
                  <SelectValue placeholder="Selecione o vencedor" className="text-gray-300" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700/95 border-gray-600 shadow-xl backdrop-blur-sm">
                  {selectedPlayers.map((playerId) => {
                    const player = players.find((p) => p.id === playerId)
                    return player ? (
                      <SelectItem
                        key={player.id}
                        value={player.id}
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

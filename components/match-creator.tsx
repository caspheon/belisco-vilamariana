"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { GamepadIcon, Users, User, Trophy } from "lucide-react"
import type { Player, CreateMatch } from "../lib/types"

interface MatchCreatorProps {
  players: Player[]
  onAddMatch: (match: CreateMatch) => void
}

export function MatchCreator({ players, onAddMatch }: MatchCreatorProps) {
  const [matchType, setMatchType] = useState<"individual" | "dupla">("individual")
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [selectedWinners, setSelectedWinners] = useState<string[]>([])

  // Organizar jogadores alfabeticamente
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const handlePlayerSelect = (playerName: string, position: number) => {
    if (!playerName) return // Proteção contra valores vazios
    
    const newSelectedPlayers = [...selectedPlayers]
    newSelectedPlayers[position] = playerName
    setSelectedPlayers(newSelectedPlayers)

    // Reset winners if they're no longer in the match
    if (selectedWinners.length > 0) {
      const newWinners = selectedWinners.filter(winner => 
        newSelectedPlayers.includes(winner)
      )
      setSelectedWinners(newWinners)
    }
  }

  const handleWinnerSelect = (winnerName: string, checked: boolean) => {
    if (checked) {
      setSelectedWinners(prev => [...prev, winnerName])
    } else {
      setSelectedWinners(prev => prev.filter(w => w !== winnerName))
    }
  }

  const handleCreateMatch = () => {
    const requiredPlayers = matchType === "individual" ? 2 : 4
    const requiredWinners = matchType === "individual" ? 1 : 2
    
    if (selectedPlayers.filter(Boolean).length === requiredPlayers && 
        selectedWinners.length === requiredWinners) {
      
      // Validação adicional: garantir que são nomes válidos, não IDs
      const playerNames = selectedPlayers.filter(Boolean)
      
      // Verificar se todos os valores são strings válidas (nomes) e não números
      const hasInvalidData = playerNames.some(name => {
        // Verificar se é um número ou se contém apenas dígitos
        if (typeof name === 'string' && (/^\d+$/.test(name) || !isNaN(Number(name)))) {
          console.error('❌ ERRO: ID detectado em vez de nome:', name)
          return true
        }
        return false
      })
      
      if (hasInvalidData) {
        alert('❌ Erro: Dados inválidos detectados. Por favor, selecione jogadores válidos.')
        return
      }
      
      // Verificar se os vencedores também são nomes válidos
      const hasInvalidWinners = selectedWinners.some(winner => {
        if (typeof winner === 'string' && (/^\d+$/.test(winner) || !isNaN(Number(winner)))) {
          console.error('❌ ERRO: ID detectado em vencedores:', winner)
          return true
        }
        return false
      })
      
      if (hasInvalidWinners) {
        alert('❌ Erro: Dados inválidos detectados nos vencedores. Por favor, selecione vencedores válidos.')
        return
      }

      onAddMatch({
        type: matchType,
        players: playerNames, // Enviar nomes em vez de IDs
        winner: selectedWinners, // Sempre enviar como array
      })

      // Reset form
      setSelectedPlayers([])
      setSelectedWinners([])
    }
  }

  const requiredPlayers = matchType === "individual" ? 2 : 4
  const requiredWinners = matchType === "individual" ? 1 : 2
  const canCreateMatch = selectedPlayers.filter(Boolean).length === requiredPlayers && 
                        selectedWinners.length === requiredWinners

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
            <GamepadIcon className="h-5 w-5 text-green-400" />Nova Partida
          </CardTitle>
          <CardDescription className="text-gray-200">Configure uma nova partida de sinuca</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium text-green-400 drop-shadow-sm">Tipo de Partida</Label>
                                      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
               <div className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer h-24 text-center ${
                 matchType === "individual" 
                   ? "bg-green-600/20 border-green-400 text-green-400" 
                   : "bg-gray-700/50 border-gray-600/50 text-gray-200 hover:bg-gray-600/50 hover:border-green-400/30"
               }`} onClick={() => setMatchType("individual")}>
                 <User className="h-6 w-6 mb-2" />
                 <span className="font-medium text-sm">Individual (X1)</span>
               </div>
               <div className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer h-24 text-center ${
                 matchType === "dupla" 
                   ? "bg-green-600/20 border-green-400 text-green-400" 
                   : "bg-gray-700/50 border-gray-600/50 text-gray-200 hover:bg-gray-600/50 hover:border-green-400/30"
               }`} onClick={() => setMatchType("dupla")}>
                 <Users className="h-6 w-6 mb-2" />
                 <span className="font-medium text-sm">Dupla (2v2)</span>
               </div>
             </div>
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
                     value={(() => {
                       const playerId = selectedPlayers[index]
                       if (!playerId) return ""
                       const player = players.find(p => p.id.toString() === playerId)
                       return player ? player.name : ""
                     })()}
                     onValueChange={(value) => handlePlayerSelect(value, index)}
                     placeholder="Selecione um jogador"
                   >
                     <SelectContent className="max-h-60 overflow-y-auto custom-scrollbar">
                       {sortedPlayers
                         .filter(
                           (player) => {
                             const isCurrentlySelected = selectedPlayers[index] === player.name
                             const isSelectedElsewhere = selectedPlayers.includes(player.name) && !isCurrentlySelected
                             return !isSelectedElsewhere
                           }
                         )
                         .map((player) => (
                           <SelectItem
                             key={player.id}
                             value={player.name}
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
                <Trophy className="h-4 w-4 text-yellow-400" />🏆 {matchType === "individual" ? "Vencedor da Partida" : "Dupla Vencedora"}
              </Label>
              
              {matchType === "individual" ? (
                // Seleção individual - apenas um vencedor
                <Select 
                  value={selectedWinners[0] || ""} 
                  onValueChange={(value) => setSelectedWinners([value])}
                  placeholder="Selecione o vencedor"
                >
                  <SelectContent className="max-h-60 overflow-y-auto custom-scrollbar">
                    {selectedPlayers.filter(Boolean).map((playerName) => {
                      return (
                        <SelectItem
                          key={playerName}
                          value={playerName}
                          className="text-white hover:bg-gray-600/80 focus:bg-gray-600/80 transition-colors duration-150"
                        >
                          {playerName}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              ) : (
                // Seleção de dupla - múltiplos vencedores
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">Selecione os 2 jogadores da dupla vencedora:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                         {selectedPlayers.filter(Boolean).map((playerName) => {
                       const isSelected = selectedWinners.includes(playerName)
                       
                       return (
                         <div
                           key={playerName}
                           className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                             isSelected
                               ? "bg-green-600/20 border-green-400/50 text-green-400"
                               : "bg-gray-700/50 border-gray-600/50 text-gray-200 hover:bg-gray-600/50 hover:border-green-400/30"
                           }`}
                           onClick={() => handleWinnerSelect(playerName, !isSelected)}
                         >
                           <div className="flex items-center justify-between">
                             <span className="font-medium">{playerName}</span>
                             {isSelected && (
                               <Badge className="bg-green-600/90 text-white">
                                 Selecionado
                               </Badge>
                             )}
                           </div>
                         </div>
                       )
                     })}
                  </div>
                  <p className="text-xs text-gray-400">
                    {selectedWinners.length}/2 jogadores selecionados
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Create Match Button */}
          <Button
            onClick={handleCreateMatch}
            disabled={!canCreateMatch}
            className="w-full bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-6"
            size="lg"
          >
            <Trophy className="h-5 w-5 mr-2" />Registrar Partida
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

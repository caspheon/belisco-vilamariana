"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Plus, User, Trophy, Users, Calendar, BarChart3, X, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import type { Player, Match } from "../lib/types"

interface PlayerManagerProps {
  players: Player[]
  matches: Match[]
  onAddPlayer: (name: string) => void
}

export function PlayerManager({ players, matches, onAddPlayer }: PlayerManagerProps) {
  const [newPlayerName, setNewPlayerName] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showAllPlayers, setShowAllPlayers] = useState(false)

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && !players.some((p) => p.name.toLowerCase() === newPlayerName.toLowerCase())) {
      onAddPlayer(newPlayerName.trim())
      setNewPlayerName("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPlayer()
    }
  }

  const openPlayerDetails = (player: Player) => {
    setSelectedPlayer(player)
    setShowDetails(true)
  }

  const closePlayerDetails = () => {
    setShowDetails(false)
    setSelectedPlayer(null)
  }

  // Organizar jogadores alfabeticamente
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  
  // Limitar para mostrar apenas os 10 primeiros ou todos se expandido
  const displayedPlayers = showAllPlayers ? sortedPlayers : sortedPlayers.slice(0, 10)

  // Função para calcular estatísticas detalhadas do jogador
  const getPlayerDetailedStats = (playerName: string) => {
    let individualWins = 0
    let duplaWins = 0
    let individualMatches = 0
    let duplaMatches = 0

    matches.forEach(match => {
      if (!match.players || !match.winner) return

      const isPlayerInMatch = match.players.includes(playerName)
      if (!isPlayerInMatch) return

      const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
      const isPlayerWinner = winners.includes(playerName)

      if (match.type === 'individual') {
        individualMatches++
        if (isPlayerWinner) individualWins++
      } else if (match.type === 'dupla') {
        duplaMatches++
        if (isPlayerWinner) duplaWins++
      }
    })

    return { 
      individualWins, 
      duplaWins, 
      individualMatches, 
      duplaMatches,
      totalWins: individualWins + duplaWins,
      totalMatches: individualMatches + duplaMatches
    }
  }

  // Função para obter histórico de partidas do jogador
  const getPlayerMatchHistory = (playerName: string) => {
    const playerMatches = matches.filter(match => 
      match.players && match.players.includes(playerName)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return playerMatches.map(match => {
      const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
      const isPlayerWinner = winners.includes(playerName)
      const matchDate = new Date(match.date)
      const adjustedDate = new Date(matchDate.getTime() - (3 * 60 * 60 * 1000))

      return {
        ...match,
        isWinner: isPlayerWinner,
        formattedDate: adjustedDate.toLocaleDateString("pt-BR", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        formattedTime: adjustedDate.toLocaleTimeString("pt-BR", {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Add Player Form */}
      <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400 drop-shadow-sm">
            <Plus className="h-5 w-5 text-green-400" />Adicionar Novo Jogador
          </CardTitle>
          <CardDescription className="text-gray-200">
            Digite o nome do jogador para adicioná-lo ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Nome do jogador"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-gray-700/90 border-gray-500 text-white placeholder:text-gray-300 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all duration-200 shadow-inner"
            />
            <Button
              onClick={handleAddPlayer}
              disabled={
                !newPlayerName.trim() || players.some((p) => p.name.toLowerCase() === newPlayerName.toLowerCase())
              }
              className="bg-green-600 hover:bg-green-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
          {players.some((p) => p.name.toLowerCase() === newPlayerName.toLowerCase()) && (
            <p className="text-sm text-red-400 mt-2 animate-pulse">Este jogador já existe!</p>
          )}
        </CardContent>
      </Card>

      {/* Players List */}
      <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400 drop-shadow-sm">
            <User className="h-5 w-5 text-green-400" />Jogadores Cadastrados ({players.length})
          </CardTitle>
          <CardDescription className="text-gray-200">
            Lista de jogadores organizados alfabeticamente
            {!showAllPlayers && players.length > 10 && (
              <span className="block mt-1 text-sm text-gray-400">
                Mostrando os 10 primeiros de {players.length} jogadores
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum jogador cadastrado ainda.</p>
              <p className="text-sm text-gray-400">Adicione o primeiro jogador acima!</p>
            </div>
          ) : (
            <div className="max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                {displayedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="p-4 border border-gray-600/50 rounded-lg bg-gradient-to-br from-gray-700/80 to-gray-800/80 hover:from-gray-600/80 hover:to-gray-700/80 hover:shadow-lg hover:border-green-400/30 transition-all duration-300 backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-green-400 drop-shadow-sm text-lg">{player.name}</h3>
                      <Badge variant="secondary" className="bg-green-600/90 text-white shadow-md text-sm">
                        {player.rating} pts
                      </Badge>
                    </div>
                    
                    <Button
                      onClick={() => openPlayerDetails(player)}
                      variant="outline"
                      className="w-full border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400 transition-all duration-200"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Botão Mostrar Mais/Menos */}
          {players.length > 10 && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => setShowAllPlayers(!showAllPlayers)}
                variant="outline"
                className="border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400 transition-all duration-200"
              >
                {showAllPlayers ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Mostrar Menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Mostrar Mais ({players.length - 10} jogadores restantes)
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Details Modal */}
      {showDetails && selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800/95 border border-gray-600/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-600/50 bg-gradient-to-r from-gray-800 to-gray-700">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold text-green-400">{selectedPlayer.name}</h2>
                    <Badge variant="secondary" className="bg-green-600/90 text-white shadow-md">
                  {selectedPlayer.rating} pts
                    </Badge>
                  </div>
              <Button
                onClick={closePlayerDetails}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-700/50 border border-gray-600/50">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="individual" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                    <User className="h-4 w-4 mr-2" />
                    Individual
                  </TabsTrigger>
                  <TabsTrigger value="dupla" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                    <Users className="h-4 w-4 mr-2" />
                    Dupla
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gray-700/50 border-gray-600/50">
                      <CardContent className="p-4 text-center">
                        <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                        <div className="text-2xl font-bold text-green-400">{selectedPlayer.wins}</div>
                        <div className="text-sm text-gray-300">Vitórias Totais</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-700/50 border-gray-600/50">
                      <CardContent className="p-4 text-center">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                        <div className="text-2xl font-bold text-blue-400">{selectedPlayer.matches}</div>
                        <div className="text-sm text-gray-300">Partidas Totais</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-700/50 border-gray-600/50">
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                        <div className="text-2xl font-bold text-purple-400">
                          {selectedPlayer.matches > 0 ? ((selectedPlayer.wins / selectedPlayer.matches) * 100).toFixed(1) : 0}%
                        </div>
                        <div className="text-sm text-gray-300">Taxa de Vitória</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Estatísticas por tipo */}
                  <Card className="bg-gray-700/50 border-gray-600/50">
                    <CardHeader>
                      <CardTitle className="text-green-400">Estatísticas por Tipo de Partida</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(() => {
                          const stats = getPlayerDetailedStats(selectedPlayer.name)
                          return (
                            <>
                              <div className="space-y-3">
                                <h4 className="text-blue-400 font-semibold flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Partidas Individuais
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Partidas:</span>
                                    <span className="font-medium text-blue-400">{stats.individualMatches}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Vitórias:</span>
                                    <span className="font-medium text-green-400">{stats.individualWins}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-300">Taxa:</span>
                                    <span className="font-medium text-purple-400">
                                      {stats.individualMatches > 0 ? ((stats.individualWins / stats.individualMatches) * 100).toFixed(1) : 0}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="text-purple-400 font-semibold flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Partidas em Dupla
                                </h4>
                                <div className="space-y-2">
                    <div className="flex justify-between">
                                    <span className="text-gray-300">Partidas:</span>
                                    <span className="font-medium text-purple-400">{stats.duplaMatches}</span>
                    </div>
                    <div className="flex justify-between">
                                    <span className="text-gray-300">Vitórias:</span>
                                    <span className="font-medium text-green-400">{stats.duplaWins}</span>
                    </div>
                    <div className="flex justify-between">
                                    <span className="text-gray-300">Taxa:</span>
                                    <span className="font-medium text-purple-400">
                                      {stats.duplaMatches > 0 ? ((stats.duplaWins / stats.duplaMatches) * 100).toFixed(1) : 0}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Individual Tab */}
                <TabsContent value="individual" className="mt-6">
                  <Card className="bg-gray-700/50 border-gray-600/50">
                    <CardHeader>
                      <CardTitle className="text-blue-400 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Histórico de Partidas Individuais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const stats = getPlayerDetailedStats(selectedPlayer.name)
                        const individualMatches = getPlayerMatchHistory(selectedPlayer.name).filter(match => match.type === 'individual')
                        
                        if (individualMatches.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-400">
                              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>Nenhuma partida individual encontrada.</p>
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-3">
                            {individualMatches.map((match) => (
                              <div
                                key={match.id}
                                className={`p-4 border rounded-lg transition-all duration-200 ${
                                  match.isWinner
                                    ? "border-green-500/50 bg-green-500/10"
                                    : "border-red-500/50 bg-red-500/10"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge
                                        variant="outline"
                                        className={`${
                                          match.isWinner
                                            ? "border-green-400/70 text-green-400 bg-green-400/10"
                                            : "border-red-400/70 text-red-400 bg-red-400/10"
                                        }`}
                                      >
                                        {match.isWinner ? "Vitória" : "Derrota"}
                                      </Badge>
                                      <div className="text-xs text-gray-400">
                                        📅 {match.formattedDate} 🕐 {match.formattedTime}
                                      </div>
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-200">
                                        {match.isWinner ? "Venceu:" : "Perdeu:"}
                                      </span>
                                      <span className="text-gray-100 ml-2 font-semibold">
                                        {match.players.filter(p => p !== selectedPlayer.name).join(" e ")}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right text-xs text-gray-400">
                                    Partida #{match.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Dupla Tab */}
                <TabsContent value="dupla" className="mt-6">
                  <Card className="bg-gray-700/50 border-gray-600/50">
                    <CardHeader>
                      <CardTitle className="text-purple-400 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Histórico de Partidas em Dupla
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const stats = getPlayerDetailedStats(selectedPlayer.name)
                        const duplaMatches = getPlayerMatchHistory(selectedPlayer.name).filter(match => match.type === 'dupla')
                        
                        if (duplaMatches.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-400">
                              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>Nenhuma partida em dupla encontrada.</p>
                            </div>
                          )
                        }

                        return (
                          <div className="space-y-3">
                            {duplaMatches.map((match) => {
                              const winners = Array.isArray(match.winner) ? match.winner : [match.winner]
                              const losers = match.players.filter(p => !winners.includes(p))
                              
                              // Time do jogador selecionado (incluindo ele mesmo)
                              const playerTeam = match.players.filter(p => p === selectedPlayer.name || winners.includes(p) === match.isWinner)
                              
                              // Time oponente (excluindo o jogador selecionado e seu time)
                              const opponentTeam = match.players.filter(p => !playerTeam.includes(p))
                              
                              return (
                                <div
                                  key={match.id}
                                  className={`p-4 border rounded-lg transition-all duration-200 ${
                                    match.isWinner
                                      ? "border-green-500/50 bg-green-500/10"
                                      : "border-red-500/50 bg-red-500/10"
                                  }`}
                                >
                                  <div className="space-y-3">
                                    {/* Header com resultado e data */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className={`${
                                            match.isWinner
                                              ? "border-green-400/70 text-green-400 bg-green-400/10"
                                              : "border-red-400/70 text-red-400 bg-red-400/10"
                                          }`}
                                        >
                                          {match.isWinner ? "Vitória" : "Derrota"}
                                        </Badge>
                                        <div className="text-xs text-gray-400">
                                          📅 {match.formattedDate} 🕐 {match.formattedTime}
                                        </div>
                                      </div>
                                      
                                      <div className="text-xs text-gray-400 self-end sm:self-auto">
                                        Partida #{match.id}
                                      </div>
                                    </div>
                                    
                                    {/* Times organizados verticalmente */}
                                    <div className="space-y-2">
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="font-medium text-gray-200 text-sm whitespace-nowrap">
                                          {match.isWinner ? "Venceu:" : "Perdeu:"}
                                        </span>
                                        <span className="text-gray-100 font-semibold break-words">
                                          {playerTeam.join(" e ")}
                                        </span>
                                      </div>
                                      
                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className="font-medium text-gray-200 text-sm whitespace-nowrap">
                                          {match.isWinner ? "contra" : "para"}
                                        </span>
                                        <span className="text-gray-100 font-semibold break-words">
                                          {opponentTeam.join(" e ")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
        </CardContent>
      </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

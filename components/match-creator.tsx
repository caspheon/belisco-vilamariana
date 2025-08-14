"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Target, Users, Trophy, RefreshCw } from "lucide-react"
import type { Player, CreateMatch } from "../lib/types"

interface MatchCreatorProps {
  players: Player[]
  onAddMatch: (match: Omit<CreateMatch, "title">) => void
  onRefresh: () => void
}

export function MatchCreator({ players, onAddMatch, onRefresh }: MatchCreatorProps) {
  const [player1Id, setPlayer1Id] = useState<string>("")
  const [player2Id, setPlayer2Id] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!player1Id || !player2Id || player1Id === player2Id || isCreating) return

    setIsCreating(true)
    try {
      await onAddMatch({
        player1Id: parseInt(player1Id),
        player2Id: parseInt(player2Id)
      })
      
      // Reset form
      setPlayer1Id("")
      setPlayer2Id("")
    } finally {
      setIsCreating(false)
    }
  }

  const handleRefresh = () => {
    onRefresh()
  }

  const canCreateMatch = player1Id && player2Id && player1Id !== player2Id && !isCreating

  if (players.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Criar Nova Partida
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Jogadores insuficientes</p>
          <p className="text-sm text-gray-500 mb-4">
            Você precisa de pelo menos 2 jogadores para criar uma partida
          </p>
          <p className="text-sm text-gray-400">
            Atualmente: {players.length} jogador{players.length !== 1 ? 'es' : ''}
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
            <Target className="w-5 h-5" />
            Criar Nova Partida
          </CardTitle>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para criar partida */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jogador 1 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                🎯 Jogador 1 (Vencedor)
              </label>
              <Select value={player1Id} onValueChange={setPlayer1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o primeiro jogador" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Jogador 2 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                🎯 Jogador 2 (Perdedor)
              </label>
              <Select value={player2Id} onValueChange={setPlayer2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o segundo jogador" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Validações */}
          {player1Id && player2Id && player1Id === player2Id && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                ❌ Os jogadores devem ser diferentes
              </p>
            </div>
          )}

          {/* Botão de criação */}
          <Button 
            type="submit" 
            disabled={!canCreateMatch}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Criando Partida...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Criar Partida
              </>
            )}
          </Button>
        </form>

        {/* Informações da partida */}
        {canCreateMatch && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Resumo da Partida</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">Vencedor:</span>
                <span className="text-gray-700">
                  {players.find(p => p.id.toString() === player1Id)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">Perdedor:</span>
                <span className="text-gray-700">
                  {players.find(p => p.id.toString() === player2Id)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">Data:</span>
                <span className="text-gray-700">
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">Tipo:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Individual
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-700 mb-2">📊 Estatísticas</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Total de Jogadores:</span>
              <span className="ml-2 text-gray-700">{players.length}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Jogadores Disponíveis:</span>
              <span className="ml-2 text-gray-700">
                {players.length >= 2 ? `${players.length} jogadores` : "Insuficientes"}
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Partidas Possíveis:</span>
              <span className="ml-2 text-gray-700">
                {players.length >= 2 ? Math.floor((players.length * (players.length - 1)) / 2) : 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Última Atualização:</span>
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

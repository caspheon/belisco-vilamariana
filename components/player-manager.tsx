"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Plus, User } from "lucide-react"
import type { Player } from "../lib/types"

interface PlayerManagerProps {
  players: Player[]
  onAddPlayer: (name: string) => void
}

export function PlayerManager({ players, onAddPlayer }: PlayerManagerProps) {
  const [newPlayerName, setNewPlayerName] = useState("")

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

  return (
    <div className="space-y-6">
      {/* Add Player Form */}
      <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400 drop-shadow-sm">
            <Plus className="h-5 w-5 text-green-400" />🎱 Adicionar Novo Jogador
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
            <User className="h-5 w-5 text-green-400" />👥 Jogadores Cadastrados ({players.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum jogador cadastrado ainda.</p>
              <p className="text-sm text-gray-400">Adicione o primeiro jogador acima!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="p-4 border border-gray-600/50 rounded-lg bg-gradient-to-br from-gray-700/80 to-gray-800/80 hover:from-gray-600/80 hover:to-gray-700/80 hover:shadow-lg hover:border-green-400/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-400 drop-shadow-sm">{player.name}</h3>
                    <Badge variant="secondary" className="bg-green-600/90 text-white shadow-md">
                      {player.rating}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-200 space-y-1">
                    <div className="flex justify-between">
                      <span>Partidas:</span>
                      <span className="font-medium text-gray-100">{player.matches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vitórias:</span>
                      <span className="font-medium text-green-400">{player.wins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Derrotas:</span>
                      <span className="font-medium text-red-400">{player.losses}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Users, Plus, Trash2, RefreshCw } from "lucide-react"
import type { Player } from "../lib/types"

interface PlayerManagerProps {
  players: Player[]
  onAddPlayer: (name: string) => void
  onRefresh: () => void
}

export function PlayerManager({ players, onAddPlayer, onRefresh }: PlayerManagerProps) {
  const [newPlayerName, setNewPlayerName] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlayerName.trim() || isAdding) return

    setIsAdding(true)
    try {
      await onAddPlayer(newPlayerName.trim())
      setNewPlayerName("")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRefresh = () => {
    onRefresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Jogadores
          </CardTitle>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para adicionar jogador */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            type="text"
            placeholder="Nome do jogador"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1"
            disabled={isAdding}
            required
          />
          <Button 
            type="submit" 
            disabled={!newPlayerName.trim() || isAdding}
            className="flex items-center gap-2"
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar Jogador
              </>
            )}
          </Button>
        </form>

        {/* Lista de jogadores */}
        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum jogador cadastrado</p>
            <p className="text-sm">Adicione o primeiro jogador para começar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 mb-3">
              Jogadores Cadastrados ({players.length})
            </h3>
            <div className="grid gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{player.name}</h4>
                      <p className="text-sm text-gray-500">
                        Cadastrado em {new Date(player.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ID: {player.id}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {players.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Estatísticas</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Total de Jogadores:</span>
                <span className="ml-2 text-gray-700">{players.length}</span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Mais Antigo:</span>
                <span className="ml-2 text-gray-700">
                  {players.length > 0 
                    ? new Date(Math.min(...players.map(p => new Date(p.created_at).getTime())))
                        .toLocaleDateString('pt-BR')
                    : "N/A"
                  }
                </span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Mais Recente:</span>
                <span className="ml-2 text-gray-700">
                  {players.length > 0 
                    ? new Date(Math.max(...players.map(p => new Date(p.created_at).getTime())))
                        .toLocaleDateString('pt-BR')
                    : "N/A"
                  }
                </span>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Última Atualização:</span>
                <span className="ml-2 text-gray-700">
                  {new Date().toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

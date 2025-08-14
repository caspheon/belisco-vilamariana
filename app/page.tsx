"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Users, Trophy, Target, ExternalLink } from "lucide-react"
import { PlayerManager } from "../components/player-manager"
import { MatchCreator } from "../components/match-creator"
import { RankingTable } from "../components/ranking-table"
import type { Player, Match, CreatePlayer, CreateMatch } from "../lib/types"

// Forçar renderização dinâmica para evitar erros de SSG
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SinucaManager() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados iniciais
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Buscar jogadores e partidas via API
      const [playersResponse, matchesResponse] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/matches')
      ])
      
      if (!playersResponse.ok || !matchesResponse.ok) {
        throw new Error('Erro ao carregar dados')
      }
      
      const [playersData, matchesData] = await Promise.all([
        playersResponse.json(),
        matchesResponse.json()
      ])
      
      setPlayers(playersData)
      setMatches(matchesData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados do servidor')
    } finally {
      setLoading(false)
    }
  }

  // Adicionar novo jogador
  const addPlayer = async (name: string) => {
    try {
      setError(null)
      
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar jogador')
      }
      
      const newPlayer = await response.json()
      setPlayers(prev => [...prev, newPlayer])
    } catch (err: any) {
      console.error('Erro ao adicionar jogador:', err)
      setError(err.message || 'Erro ao adicionar jogador')
    }
  }

  // Adicionar nova partida
  const addMatch = async (match: Omit<CreateMatch, "title">) => {
    try {
      setError(null)
      
      const title = `Partida ${new Date().toLocaleDateString('pt-BR')}`
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...match, title })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar partida')
      }
      
      const newMatch = await response.json()
      setMatches(prev => [...prev, newMatch])
      
      // Recarregar dados para atualizar estatísticas
      await loadData()
    } catch (err: any) {
      console.error('Erro ao adicionar partida:', err)
      setError(err.message || 'Erro ao adicionar partida')
    }
  }

  // Carregar dados na inicialização
  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Carregando Sinu Cado Belisco...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            �� Sinu Cado Belisco
          </h1>
          <p className="text-green-200 text-lg">
            Sistema de Gerenciamento de Partidas de Sinuca
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
            ❌ {error}
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Jogadores
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Partidas
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Ranking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            <PlayerManager 
              players={players} 
              onAddPlayer={addPlayer}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="matches">
            <MatchCreator 
              players={players} 
              onAddMatch={addMatch}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="ranking">
            <RankingTable 
              players={players}
              onRefresh={loadData}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 text-green-200">
          <p className="text-sm">
            Desenvolvido com ❤️ para a comunidade do Sinu Cado Belisco
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <a 
              href="https://github.com/caspheon/belisco" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-300 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

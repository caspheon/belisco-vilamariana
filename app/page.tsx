"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, Target, ExternalLink } from "lucide-react"
import { PlayerManager } from "@/components/player-manager"
import { MatchCreator } from "@/components/match-creator"
import { RankingTable } from "@/components/ranking-table"
import type { Player, Match, CreatePlayer, CreateMatch } from "@/lib/types"
import { getAllPlayers, createPlayer, getAllMatches, createMatch, getRanking } from "@/lib/db-functions"

export default function SinucaManager() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from database on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [playersData, matchesData] = await Promise.all([
        getAllPlayers(),
        getAllMatches()
      ])
      
      setPlayers(playersData)
      setMatches(matchesData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao conectar com o banco de dados. Verifique a configuração.')
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = async (name: string) => {
    try {
      setError(null)
      const newPlayer = await createPlayer({ name })
      setPlayers(prev => [...prev, newPlayer])
    } catch (err) {
      console.error('Erro ao adicionar jogador:', err)
      setError('Erro ao adicionar jogador. Tente novamente.')
    }
  }

  const addMatch = async (match: Omit<CreateMatch, "title">) => {
    try {
      setError(null)
      const title = `Partida ${new Date().toLocaleDateString('pt-BR')}`
      const newMatch = await createMatch({ ...match, title })
      setMatches(prev => [...prev, newMatch])
      
      // Recarregar dados para atualizar estatísticas
      await loadData()
    } catch (err) {
      console.error('Erro ao criar partida:', err)
      setError('Erro ao criar partida. Tente novamente.')
    }
  }

  const totalMatches = matches.length
  const totalPlayers = players.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-green-400 text-xl">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Erro de Conexão</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-2 flex items-center justify-center gap-3 drop-shadow-lg">
            🎱 Sinuquinha do Belisco 🎱
          </h1>
          <p className="text-green-300/90 text-lg md:text-xl">Organize partidas e acompanhe o ranking dos jogadores</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">Total de Jogadores</CardTitle>
              <Users className="h-4 w-4 text-green-400 drop-shadow-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 drop-shadow-sm">{totalPlayers}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">Partidas Jogadas</CardTitle>
              <Target className="h-4 w-4 text-green-400 drop-shadow-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 drop-shadow-sm">{totalMatches}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/95 border-gray-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">Líder Atual</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400 drop-shadow-sm" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 drop-shadow-sm">
                {players.length > 0 ? players.sort((a, b) => b.rating - a.rating)[0]?.name || "N/A" : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/95 border-gray-600/50 shadow-lg">
            <TabsTrigger
              value="players"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-gray-200 hover:text-white hover:bg-gray-700"
            >
              🎯 Jogadores
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-gray-200 hover:text-white hover:bg-gray-700"
            >
              🎱 Nova Partida
            </TabsTrigger>
            <TabsTrigger
              value="ranking"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-gray-200 hover:text-white hover:bg-gray-700"
            >
              🏆 Ranking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            <PlayerManager players={players} onAddPlayer={addPlayer} />
          </TabsContent>

          <TabsContent value="matches">
            <MatchCreator players={players} onAddMatch={addMatch} />
          </TabsContent>

          <TabsContent value="ranking">
            <RankingTable players={players} matches={matches} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/95 border-t border-gray-700/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-300 text-sm md:text-base">
                Desenvolvido por <span className="text-green-400 font-semibold">Caspheon</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://caspheon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors duration-200 text-sm md:text-base group"
              >
                <span>caspheon.com</span>
                <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              </a>

              <div className="w-px h-4 bg-gray-600"></div>

              <a
                href="https://www.linkedin.com/company/caspheon/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm md:text-base group"
              >
                <svg
                  className="h-4 w-4 group-hover:scale-110 transition-transform duration-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

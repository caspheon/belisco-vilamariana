"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Users, Trophy, Target, ExternalLink } from "lucide-react"
import { PlayerManager } from "../components/player-manager"
import { MatchCreator } from "../components/match-creator"
import { RankingTable } from "../components/ranking-table"
import { HamburgerMenu } from "../components/hamburger-menu"
import type { Player, Match, CreatePlayer, CreateMatch } from "../lib/types"

export default function SinucaManager() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminUsername, setAdminUsername] = useState("")

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
  const addMatch = async (match: CreateMatch) => {
    try {
      setError(null)
      
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(match)
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

  // Funções administrativas
  const handleLogin = (username: string, password: string) => {
    if (username === "admin" && password === "admin") {
      setIsLoggedIn(true)
      setAdminUsername(username)
      setError(null)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setAdminUsername("")
  }

  const handleDeletePlayer = async (playerId: number) => {
    if (!isLoggedIn) return
    
    try {
      setError(null)
      
      // Apagar jogador via API
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Erro ao apagar jogador')
      }
      
      setPlayers(prev => prev.filter(p => p.id !== playerId))
      setError(null)
    } catch (err: any) {
      console.error('Erro ao apagar jogador:', err)
      setError('Erro ao apagar jogador')
    }
  }

  const handleDeleteMatch = async (matchId: number) => {
    if (!isLoggedIn) return
    
    try {
      setError(null)
      
      // Apagar partida via API
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Erro ao apagar partida')
      }
      
      setMatches(prev => prev.filter(m => m.id !== matchId))
      setError(null)
    } catch (err: any) {
      console.error('Erro ao apagar partida:', err)
      setError('Erro ao apagar partida')
    }
  }

  const handleEditPlayer = async (playerId: number, newName: string) => {
    if (!isLoggedIn) return
    
    try {
      setError(null)
      
      // Atualizar nome do jogador via API
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao editar jogador')
      }
      
      const result = await response.json()
      
      // Atualizar lista local de jogadores
      setPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, name: newName } : p
      ))
      
      // Recarregar dados completos para sincronizar estatísticas
      await loadData()
      
      // Mostrar mensagem de sucesso com detalhes
      setError(null)
      alert(`✅ ${result.message}`)
      
    } catch (err: any) {
      console.error('Erro ao editar jogador:', err)
      setError(err.message || 'Erro ao editar jogador')
    }
  }

  // Carregar dados na inicialização
  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-xl text-green-400">Carregando Sinuquinha do Belisco...</p>
        </div>
      </div>
    )
  }

  const totalMatches = matches.length
  const totalPlayers = players.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex flex-col">
      {/* Menu Hambúrguer */}
      <HamburgerMenu
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onDeletePlayer={handleDeletePlayer}
        onDeleteMatch={handleDeleteMatch}
        onEditPlayer={handleEditPlayer}
        players={players}
        matches={matches}
      />

      {/* Conteúdo principal com espaçamento para o header */}
      <div className="pt-16 flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-400 mb-2 flex items-center justify-center gap-3 drop-shadow-lg">
              Sinuquinha do Belisco
            </h1>
            <p className="text-green-300/90 text-base md:text-lg lg:text-xl">Organize partidas e acompanhe o ranking dos jogadores</p>
            
            {/* Indicador de status de login */}
            {isLoggedIn && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Admin Logado: {adminUsername}</span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-600/90 text-white p-4 rounded-lg mb-6 text-center border border-red-500/50 shadow-xl">
              ❌ {error}
            </div>
          )}

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
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-gray-200 hover:text-white hover:bg-gray-700 text-sm sm:text-base"
              >
                🎯 Jogadores
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-gray-200 hover:text-white hover:bg-gray-700 text-sm sm:text-base"
              >
                🎱 Nova Partida
              </TabsTrigger>
              <TabsTrigger
                value="ranking"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-gray-200 hover:text-white hover:bg-gray-700 text-sm sm:text-base"
              >
                🏆 Ranking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players">
                              <PlayerManager players={players} matches={matches} onAddPlayer={addPlayer} />
            </TabsContent>

            <TabsContent value="matches">
              <MatchCreator players={players} onAddMatch={addMatch} />
            </TabsContent>

            <TabsContent value="ranking">
              <RankingTable players={players} matches={matches} />
            </TabsContent>
          </Tabs>
        </div>
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

"use client"

import { useState } from "react"
import { Menu, X, User, LogOut, Trash2, Users, Target, Search } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import type { Player, Match } from "../lib/types"

interface HamburgerMenuProps {
  isLoggedIn: boolean
  onLogin: (username: string, password: string) => void
  onLogout: () => void
  onDeletePlayer: (playerId: number) => void
  onDeleteMatch: (matchId: number) => void
  onEditPlayer: (playerId: number, newName: string) => void
  players: Player[]
  matches: Match[]
}

export function HamburgerMenu({ 
  isLoggedIn, 
  onLogin, 
  onLogout, 
  onDeletePlayer,
  onDeleteMatch,
  onEditPlayer,
  players,
  matches
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [showPlayerDelete, setShowPlayerDelete] = useState(false)
  const [showMatchDelete, setShowMatchDelete] = useState(false)
  const [playerSearch, setPlayerSearch] = useState("")
  const [matchSearch, setMatchSearch] = useState("")
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [editPlayerName, setEditPlayerName] = useState("")

  const handleLogin = () => {
    if (username === "admin" && password === "admin") {
      onLogin(username, password)
      setShowLogin(false)
      setUsername("")
      setPassword("")
      setLoginError("")
      setIsOpen(false)
    } else {
      setLoginError("Usuário ou senha incorretos")
    }
  }

  const handleLogout = () => {
    onLogout()
    setIsOpen(false)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setShowLogin(false)
      setShowPlayerDelete(false)
      setShowMatchDelete(false)
      setUsername("")
      setPassword("")
      setLoginError("")
      setPlayerSearch("")
      setMatchSearch("")
    }
  }

  const openLogin = () => {
    setShowLogin(true)
    setLoginError("")
  }

  const openPlayerDelete = () => {
    setShowPlayerDelete(true)
    setShowMatchDelete(false)
  }

  const openMatchDelete = () => {
    setShowMatchDelete(true)
    setShowPlayerDelete(false)
  }

  const handleDeletePlayer = (playerId: number) => {
    if (confirm(`Tem certeza que deseja apagar este jogador?`)) {
      onDeletePlayer(playerId)
    }
  }

  const handleDeleteMatch = (matchId: number) => {
    if (confirm(`Tem certeza que deseja apagar esta partida?`)) {
      onDeleteMatch(matchId)
    }
  }

  const startEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setEditPlayerName(player.name)
  }

  const cancelEditPlayer = () => {
    setEditingPlayer(null)
    setEditPlayerName("")
  }

  const saveEditPlayer = () => {
    if (editPlayerName.trim() && editPlayerName !== editingPlayer?.name) {
      if (editingPlayer) {
        onEditPlayer(editingPlayer.id, editPlayerName.trim())
        setEditingPlayer(null)
        setEditPlayerName("")
      }
    }
  }

  // Filtrar jogadores por busca
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(playerSearch.toLowerCase())
  )

  // Filtrar partidas por busca
  const filteredMatches = matches.filter(match =>
    match.players.some(player => 
      player.toLowerCase().includes(matchSearch.toLowerCase())
    ) || match.type.toLowerCase().includes(matchSearch.toLowerCase())
  )

  return (
    <>
      {/* Header responsivo */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 border-b border-gray-600/50 backdrop-blur-sm shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo/Título do site */}
          <div className="flex items-center">
            <h2 className="text-lg font-bold text-green-400 hidden sm:block"></h2>
            <h2 className="text-base font-bold text-green-400 sm:hidden"></h2>
          </div>

          {/* Botão do menu hambúrguer */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="bg-gray-800/90 hover:bg-gray-700/90 text-white border border-gray-600/50 shadow-lg p-2"
            aria-label="Abrir menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Menu lateral responsivo */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay escuro */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMenu}
          />
          
          {/* Menu lateral - responsivo */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-gray-900/95 border-l border-gray-600/50 shadow-2xl backdrop-blur-sm transform transition-transform duration-300 ease-in-out">
            <div className="p-4 sm:p-6 h-full flex flex-col">
              {/* Header do menu */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-600/50">
                <h2 className="text-xl font-bold text-green-400">Menu Admin</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMenu}
                  className="text-gray-400 hover:text-white p-2"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Conteúdo do menu */}
              <div className="flex-1 space-y-4 overflow-y-auto">
                {!isLoggedIn ? (
                  // Menu para usuários não logados
                  <div className="space-y-4">
                    <Card className="bg-gray-800/95 border-gray-600/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-gray-100 text-lg">Acesso Administrativo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">
                          Faça login para acessar funções administrativas
                        </p>
                        <Button 
                          onClick={openLogin}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Fazer Login
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  // Menu para usuários logados
                  <div className="space-y-4">
                    <Card className="bg-gray-800/95 border-gray-600/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-green-400 text-lg">Admin Logado</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">
                          Bem-vindo, {username}!
                        </p>
                        <Button 
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Gestão de Jogadores */}
                    <Card className="bg-gray-800/95 border-gray-600/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-blue-400 text-lg">Gestão de Jogadores</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          onClick={openPlayerDelete}
                          variant="outline"
                          className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Gerenciar Jogadores</span>
                          <span className="sm:hidden">Jogadores</span>
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Gestão de Partidas */}
                    <Card className="bg-gray-800/95 border-gray-600/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-purple-400 text-lg">Gestão de Partidas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          onClick={openMatchDelete}
                          variant="outline"
                          className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Gerenciar Partidas</span>
                          <span className="sm:hidden">Partidas</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Painel de Gestão de Jogadores */}
                {showPlayerDelete && (
                  <Card className="bg-gray-800/95 border-blue-600/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-blue-400 text-lg">Gerenciar Jogadores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar jogador..."
                          value={playerSearch}
                          onChange={(e) => setPlayerSearch(e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                        />
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {filteredPlayers.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">
                            {playerSearch ? 'Nenhum jogador encontrado' : 'Nenhum jogador cadastrado'}
                          </p>
                        ) : (
                          filteredPlayers.map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded border border-gray-600/30">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{player.name}</p>
                                <p className="text-gray-400 text-xs">
                                  Rating: {player.rating} | Partidas: {player.matches}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => startEditPlayer(player)}
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 px-2 py-1"
                                >
                                  <User className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => handleDeletePlayer(player.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 px-2 py-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Painel de Gestão de Partidas */}
                {showMatchDelete && (
                  <Card className="bg-gray-800/95 border-purple-600/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-purple-400 text-lg">Gerenciar Partidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar partida..."
                          value={matchSearch}
                          onChange={(e) => setMatchSearch(e.target.value)}
                          className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                        />
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {filteredMatches.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">
                            {matchSearch ? 'Nenhuma partida encontrada' : 'Nenhuma partida cadastrada'}
                          </p>
                        ) : (
                          filteredMatches.map((match) => {
                            // Organizar times para partidas em dupla
                            let matchDisplay = ''
                            let winnerDisplay = ''
                            
                            if (match.type === 'dupla') {
                              // Para duplas: dividir em 2 times de 2 jogadores
                              const team1 = match.players.slice(0, 2)
                              const team2 = match.players.slice(2, 4)
                              matchDisplay = `${team1.join(' e ')} vs ${team2.join(' e ')}`
                            } else {
                              // Para individuais: manter como está
                              matchDisplay = match.players.join(' vs ')
                            }
                            
                            // Formatar vencedores
                            if (Array.isArray(match.winner)) {
                              winnerDisplay = match.winner.join(', ')
                            } else {
                              winnerDisplay = match.winner
                            }
                            
                            // Formatar data e hora se disponível
                            const matchDate = match.date ? new Date(match.date) : null
                            
                            let formattedDate = 'N/A'
                            let formattedTime = 'N/A'
                            
                            if (matchDate) {
                              // Mesma lógica de Partidas Recentes: ajustar para UTC-3 subtraindo 3 horas
                              const adjustedDate = new Date(matchDate.getTime() - (3 * 60 * 60 * 1000))
                              
                              formattedDate = adjustedDate.toLocaleDateString('pt-BR')
                              formattedTime = adjustedDate.toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            }
                            
                            return (
                              <div key={match.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded border border-gray-600/30">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-white text-sm font-medium">
                                      {match.type === 'individual' ? 'Individual' : 'Dupla'}
                                    </p>
                                    <span className="text-gray-500 text-xs">
                                      #{match.id}
                                    </span>
                                  </div>
                                  
                                  <p className="text-gray-300 text-sm mb-1">
                                    {matchDisplay}
                                  </p>
                                  
                                  <p className="text-green-400 text-xs mb-1">
                                    Vencedor: {winnerDisplay}
                                  </p>
                                  
                                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                                    <span>📅 {formattedDate}</span>
                                    <span>🕐 {formattedTime}</span>
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => handleDeleteMatch(match.id)}
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 border-red-500/50 text-red-400 hover:bg-red-500/10 px-2 py-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Footer do menu */}
              <div className="pt-4 border-t border-gray-600/50">
                <p className="text-gray-400 text-xs text-center">
                  Sistema Administrativo
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Login responsivo */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <Card className="relative w-full max-w-sm bg-gray-800/95 border-gray-600/50 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-green-400 text-xl text-center">Login Administrativo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-200">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite o usuário"
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="bg-gray-400/50 border-gray-600/50 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              {loginError && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/30">
                  {loginError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleLogin}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => setShowLogin(false)}
                  variant="outline"
                  className="flex-1 border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Edição de Nome do Jogador */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <Card className="relative w-full max-w-sm bg-gray-800/95 border-blue-600/50 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-blue-400 text-xl text-center">Editar Nome do Jogador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editPlayerName" className="text-gray-200">Nome Atual</Label>
                <p className="text-gray-300 text-sm bg-gray-700/50 p-2 rounded border border-gray-600/30">
                  {editingPlayer.name}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPlayerName" className="text-gray-200">Novo Nome</Label>
                <Input
                  id="editPlayerName"
                  type="text"
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  placeholder="Digite o novo nome"
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && saveEditPlayer()}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={saveEditPlayer}
                  disabled={!editPlayerName.trim() || editPlayerName.trim() === editingPlayer.name}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar
                </Button>
                <Button 
                  onClick={cancelEditPlayer}
                  variant="outline"
                  className="flex-1 border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

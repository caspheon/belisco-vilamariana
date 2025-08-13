-- Schema para Sinu Cado Belisco
-- Banco de dados: Neon PostgreSQL

-- Tabela de Jogadores
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Tabela de Partidas
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    match_date DATE NOT NULL,
    match_time TIME,
    location VARCHAR(200),
    max_players INTEGER DEFAULT 4,
    min_players INTEGER DEFAULT 2,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES players(id)
);

-- Tabela de Participantes das Partidas
CREATE TABLE IF NOT EXISTS match_participants (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_confirmed BOOLEAN DEFAULT false,
    UNIQUE(match_id, player_id)
);

-- Tabela de Resultados das Partidas
CREATE TABLE IF NOT EXISTS match_results (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    position INTEGER NOT NULL, -- 1º, 2º, 3º, 4º lugar
    points INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, player_id)
);

-- Tabela de Estatísticas dos Jogadores
CREATE TABLE IF NOT EXISTS player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    total_matches INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    best_position INTEGER DEFAULT 999,
    average_position DECIMAL(4,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_participants_match ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_player ON match_participants(player_id);
CREATE INDEX IF NOT EXISTS idx_match_results_match ON match_results(match_id);
CREATE INDEX IF NOT EXISTS idx_match_results_player ON match_results(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular estatísticas do jogador
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas quando um resultado é inserido/atualizado
    INSERT INTO player_stats (player_id, total_matches, total_wins, total_points, best_position, average_position, last_updated)
    VALUES (
        NEW.player_id,
        (SELECT COUNT(DISTINCT match_id) FROM match_results WHERE player_id = NEW.player_id),
        (SELECT COUNT(*) FROM match_results WHERE player_id = NEW.player_id AND position = 1),
        (SELECT COALESCE(SUM(points), 0) FROM match_results WHERE player_id = NEW.player_id),
        (SELECT MIN(position) FROM match_results WHERE player_id = NEW.player_id),
        (SELECT ROUND(AVG(position)::numeric, 2) FROM match_results WHERE player_id = NEW.player_id)
    )
    ON CONFLICT (player_id) DO UPDATE SET
        total_matches = EXCLUDED.total_matches,
        total_wins = EXCLUDED.total_wins,
        total_points = EXCLUDED.total_points,
        best_position = EXCLUDED.best_position,
        average_position = EXCLUDED.average_position,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar estatísticas automaticamente
CREATE TRIGGER update_player_stats_trigger AFTER INSERT OR UPDATE ON match_results
    FOR EACH ROW EXECUTE FUNCTION update_player_stats();

-- Inserir dados de exemplo (opcional)
INSERT INTO players (name, email) VALUES 
    ('João Silva', 'joao@email.com'),
    ('Maria Santos', 'maria@email.com'),
    ('Pedro Costa', 'pedro@email.com'),
    ('Ana Oliveira', 'ana@email.com')
ON CONFLICT (name) DO NOTHING;

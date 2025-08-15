-- Schema para o Sinuquinha do Belisco
-- Estrutura adaptada para o sistema de rating e estatísticas

-- Tabela de jogadores
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de partidas
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'dupla')),
    players TEXT[] NOT NULL, -- Array de nomes dos jogadores
    winner TEXT[] NOT NULL, -- Array de nomes dos vencedores (1 para individual, 2 para dupla)
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Função para atualizar estatísticas do jogador
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar estatísticas quando uma partida é criada
    IF TG_OP = 'INSERT' THEN
        -- Incrementar matches para todos os jogadores da partida
        UPDATE players 
        SET matches = matches + 1
        WHERE name = ANY(NEW.players);
        
        -- Incrementar wins para os vencedores
        UPDATE players 
        SET wins = wins + 1
        WHERE name = ANY(NEW.winner);
        
        -- Incrementar losses para os perdedores
        UPDATE players 
        SET losses = losses + 1
        WHERE name = ANY(NEW.players) AND name != ALL(NEW.winner);
        
        -- Atualizar rating para todos os jogadores da partida
        UPDATE players 
        SET rating = CASE 
            WHEN name = ANY(NEW.winner) THEN 
                GREATEST(1000, rating + 25 + (wins * 2))
            ELSE 
                GREATEST(1000, rating - 15 + (wins * 1))
        END
        WHERE name = ANY(NEW.players);
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas automaticamente
CREATE TRIGGER update_stats_trigger
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_player_stats();

-- Índices para performance
CREATE INDEX idx_players_rating ON players(rating DESC);
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_matches_date ON matches(date DESC);
CREATE INDEX idx_matches_winner ON matches USING GIN(winner);

-- Inserir alguns jogadores de exemplo (opcional)
INSERT INTO players (name, matches, wins, losses, rating) VALUES
    ('João Silva', 0, 0, 0, 1000),
    ('Maria Santos', 0, 0, 0, 1000),
    ('Pedro Costa', 0, 0, 0, 1000)
ON CONFLICT (name) DO NOTHING;

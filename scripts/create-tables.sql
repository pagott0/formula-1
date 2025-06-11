-- Criação das tabelas principais do sistema F1
-- Este script assume que você já tem as tabelas padrão da F1 (drivers, constructors, races, etc.)
-- e adiciona as tabelas específicas do sistema

-- Tabela de usuários
-- Armazena informações de autenticação e autorização dos usuários do sistema
-- Inclui diferentes tipos de usuários (admin, team, driver) com suas respectivas restrições
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('admin', 'team', 'driver')),
    name VARCHAR(100) NOT NULL,
    constructor_id INTEGER REFERENCES constructors(id),
    driver_id INTEGER REFERENCES drivers(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP,
    CONSTRAINT check_user_type CHECK (
        (user_type = 'admin') OR
        (user_type = 'team' AND constructor_id IS NOT NULL) OR
        (user_type = 'driver' AND driver_id IS NOT NULL)
    )
);

-- Índices para a tabela users
-- Índice B-tree para username: otimiza buscas por nome de usuário e garante unicidade
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Índice B-tree para user_type: otimiza filtros por tipo de usuário (admin, team, driver)
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);

-- Índice B-tree para constructor_id: otimiza joins com a tabela constructors
CREATE INDEX IF NOT EXISTS idx_users_constructor ON users(constructor_id);

-- Índice B-tree para driver_id: otimiza joins com a tabela drivers
CREATE INDEX IF NOT EXISTS idx_users_driver ON users(driver_id);

-- Índice B-tree para created_at: otimiza ordenação e filtros por data de criação
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Tabela de log de usuários
-- Registra todas as ações realizadas pelos usuários para auditoria e segurança
-- Útil para rastrear atividades suspeitas e monitorar o uso do sistema
CREATE TABLE IF NOT EXISTS users_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para a tabela users_log
-- Índice B-tree para user_id: otimiza joins com a tabela users e filtros por usuário
CREATE INDEX IF NOT EXISTS idx_users_log_user ON users_log(user_id);

-- Índice B-tree para timestamp: otimiza consultas por período e ordenação cronológica
CREATE INDEX IF NOT EXISTS idx_users_log_timestamp ON users_log(timestamp);

-- Índice B-tree para action: otimiza filtros por tipo de ação
CREATE INDEX IF NOT EXISTS idx_users_log_action ON users_log(action);

-- Tabela de log de ações administrativas
-- Mantém um histórico detalhado de todas as operações administrativas
-- Armazena detalhes em formato JSON para flexibilidade no registro de diferentes tipos de ações
CREATE TABLE IF NOT EXISTS admin_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    details JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para a tabela admin_log
-- Índice B-tree para timestamp: otimiza consultas por período e ordenação cronológica
CREATE INDEX IF NOT EXISTS idx_admin_log_timestamp ON admin_log(timestamp);

-- Índice B-tree para action: otimiza filtros por tipo de ação administrativa
CREATE INDEX IF NOT EXISTS idx_admin_log_action ON admin_log(action);

-- Índice B-tree para table_name: otimiza filtros por tabela afetada
CREATE INDEX IF NOT EXISTS idx_admin_log_table ON admin_log(table_name);

-- Índice GIN para details: otimiza buscas no conteúdo JSON dos detalhes
CREATE INDEX IF NOT EXISTS idx_admin_log_details ON admin_log USING GIN (details);

-- Tabela de log de ações de escuderia
-- Registra operações específicas realizadas por escuderias
-- Permite rastrear mudanças e decisões importantes das equipes
CREATE TABLE IF NOT EXISTS team_log (
    id SERIAL PRIMARY KEY,
    constructor_id INTEGER REFERENCES constructors(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para a tabela team_log
-- Índice B-tree para constructor_id: otimiza joins com a tabela constructors
CREATE INDEX IF NOT EXISTS idx_team_log_constructor ON team_log(constructor_id);

-- Índice B-tree para timestamp: otimiza consultas por período e ordenação cronológica
CREATE INDEX IF NOT EXISTS idx_team_log_timestamp ON team_log(timestamp);

-- Índice B-tree para action: otimiza filtros por tipo de ação da equipe
CREATE INDEX IF NOT EXISTS idx_team_log_action ON team_log(action);

-- Índice GIN para details: otimiza buscas no conteúdo JSON dos detalhes
CREATE INDEX IF NOT EXISTS idx_team_log_details ON team_log USING GIN (details);

-- Tabela de associação entre pilotos e escuderias por ano
-- Mantém o histórico de quais pilotos competiram por quais equipes em cada temporada
-- Crucial para análises históricas e estatísticas da F1
CREATE TABLE IF NOT EXISTS driver_constructor (
    driver_id INTEGER REFERENCES drivers(id),
    constructor_id INTEGER REFERENCES constructors(id),
    year INTEGER NOT NULL,
    PRIMARY KEY (driver_id, constructor_id, year)
);

-- Índices para a tabela driver_constructor
-- Índice B-tree para year: otimiza filtros e ordenação por temporada
CREATE INDEX IF NOT EXISTS idx_driver_constructor_year ON driver_constructor(year);

-- Índice B-tree para constructor_id: otimiza joins com a tabela constructors
CREATE INDEX IF NOT EXISTS idx_driver_constructor_constructor ON driver_constructor(constructor_id);

-- Índice B-tree para driver_id: otimiza joins com a tabela drivers
CREATE INDEX IF NOT EXISTS idx_driver_constructor_driver ON driver_constructor(driver_id);

-- Extensão para criptografia
-- Necessária para funções de hash e criptografia de senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para criar usuário admin automaticamente
-- Garante que sempre exista um usuário administrador no sistema
-- Usa SHA-256 para hash da senha por segurança
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
    INSERT INTO users (username, password, user_type, name)
    VALUES ('admin', encode(digest('admin', 'sha256'), 'hex'), 'admin', 'Administrador');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para criar usuário de escuderia automaticamente
-- Trigger que cria automaticamente um usuário quando uma nova escuderia é cadastrada
-- Usa o código de referência da escuderia para gerar username e senha
CREATE OR REPLACE FUNCTION create_constructor_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (username, password, user_type, name, constructor_id)
  VALUES (
    LOWER(NEW.ref) || '_c',
    encode(digest(LOWER(NEW.ref), 'sha256'), 'hex'),
    'team',
    NEW.name,
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar usuário de piloto automaticamente
-- Trigger que cria automaticamente um usuário quando um novo piloto é cadastrado
-- Usa o código de referência do piloto para gerar username e senha
CREATE OR REPLACE FUNCTION create_driver_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (username, password, user_type, name, driver_id)
  VALUES (
    LOWER(NEW.ref) || '_d',
    encode(digest(LOWER(NEW.ref), 'sha256'), 'hex'),
    'driver',
    CONCAT(NEW.forename, ' ', NEW.surname),
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para criar usuários automaticamente
-- Executados após inserção de novos registros nas tabelas correspondentes
-- Garantem que cada escuderia e piloto tenha seu usuário no sistema
CREATE TRIGGER create_constructor_user_trigger
AFTER INSERT ON constructors
FOR EACH ROW
EXECUTE FUNCTION create_constructor_user();

CREATE TRIGGER create_driver_user_trigger
AFTER INSERT ON drivers
FOR EACH ROW
EXECUTE FUNCTION create_driver_user();

-- Executar a função para criar o usuário admin
SELECT create_admin_user();

-- Função para calcular pontos de uma escuderia em uma temporada
-- Agrega os pontos de todos os pilotos de uma equipe em uma temporada específica
-- Usada para rankings e estatísticas de equipes
CREATE OR REPLACE FUNCTION calculate_constructor_points(constructor_id INTEGER, year INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_points DECIMAL;
BEGIN
    SELECT COALESCE(SUM(r.points), 0)
    INTO total_points
    FROM results r
    JOIN races ra ON r.race_id = ra.id
    WHERE r.constructor_id = calculate_constructor_points.constructor_id
    AND ra.year = calculate_constructor_points.year;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular pontos de um piloto em uma temporada
-- Agrega os pontos de um piloto específico em uma temporada
-- Usada para rankings e estatísticas de pilotos
CREATE OR REPLACE FUNCTION calculate_driver_points(driver_id INTEGER, year INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_points DECIMAL;
BEGIN
    SELECT COALESCE(SUM(r.points), 0)
    INTO total_points
    FROM results r
    JOIN races ra ON r.race_id = ra.id
    WHERE r.driver_id = calculate_driver_points.driver_id
    AND ra.year = calculate_driver_points.year;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular a posição de uma escuderia em uma temporada
-- Determina a posição de uma equipe no campeonato de construtores
-- Usa window functions para ranking preciso
CREATE OR REPLACE FUNCTION calculate_constructor_position(constructor_id INTEGER, year INTEGER)
RETURNS INTEGER AS $$
DECLARE
    position INTEGER;
BEGIN
    WITH constructor_points AS (
        SELECT 
            c.id,
            COALESCE(SUM(r.points), 0) AS points
        FROM constructors c
        LEFT JOIN results r ON r.constructor_id = c.id
        LEFT JOIN races ra ON r.race_id = ra.id
        WHERE ra.year = calculate_constructor_position.year
        GROUP BY c.id
        ORDER BY points DESC
    )
    SELECT row_number() OVER ()
    INTO position
    FROM constructor_points
    WHERE id = calculate_constructor_position.constructor_id;
    
    RETURN position;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular a posição de um piloto em uma temporada
-- Determina a posição de um piloto no campeonato de pilotos
-- Usa window functions para ranking preciso
CREATE OR REPLACE FUNCTION calculate_driver_position(driver_id INTEGER, year INTEGER)
RETURNS INTEGER AS $$
DECLARE
    position INTEGER;
BEGIN
    WITH driver_points AS (
        SELECT 
            d.id,
            COALESCE(SUM(r.points), 0) AS points
        FROM drivers d
        LEFT JOIN results r ON r.driver_id = d.id
        LEFT JOIN races ra ON r.race_id = ra.id
        WHERE ra.year = calculate_driver_position.year
        GROUP BY d.id
        ORDER BY points DESC
    )
    SELECT row_number() OVER ()
    INTO position
    FROM driver_points
    WHERE id = calculate_driver_position.driver_id;
    
    RETURN position;
END;
$$ LANGUAGE plpgsql;

-- Função para criar usuários para construtores existentes
-- Popula a tabela de usuários com registros para escuderias já cadastradas
-- Útil para migração de dados ou inicialização do sistema
CREATE OR REPLACE FUNCTION create_users_for_existing_constructors()
RETURNS VOID AS $$
BEGIN
    INSERT INTO users (username, password, user_type, name, constructor_id)
    SELECT 
        LOWER(c.ref) || '_c',
        encode(digest(LOWER(c.ref), 'sha256'), 'hex'),
        'team',
        c.name,
        c.id
    FROM constructors c
    LEFT JOIN users u ON u.constructor_id = c.id
    WHERE u.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Executar a função para criar usuários para construtores existentes
SELECT create_users_for_existing_constructors();

-- Função para criar usuários para pilotos existentes
-- Popula a tabela de usuários com registros para pilotos já cadastrados
-- Útil para migração de dados ou inicialização do sistema
CREATE OR REPLACE FUNCTION create_users_for_existing_drivers()
RETURNS VOID AS $$
BEGIN
    INSERT INTO users (username, password, user_type, name, driver_id)
    SELECT 
        LOWER(d.ref) || '_d',
        encode(digest(LOWER(d.ref), 'sha256'), 'hex'),
        'driver',
        CONCAT(d.forename, ' ', d.surname),
        d.id
    FROM drivers d
    LEFT JOIN users u ON u.driver_id = d.id
    WHERE u.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Executar a função para criar usuários para pilotos existentes
SELECT create_users_for_existing_drivers();

-- Função para popular a tabela driver_constructor com dados históricos
-- Preenche o histórico de associações entre pilotos e escuderias
-- Baseado nos resultados das corridas para garantir precisão histórica
CREATE OR REPLACE FUNCTION populate_driver_constructor()
RETURNS VOID AS $$
BEGIN
    INSERT INTO driver_constructor (driver_id, constructor_id, year)
    SELECT DISTINCT 
        r.driver_id,
        r.constructor_id,
        EXTRACT(YEAR FROM ra.date)::INTEGER as year
    FROM results r
    JOIN races ra ON r.race_id = ra.id
    LEFT JOIN driver_constructor dc 
        ON dc.driver_id = r.driver_id 
        AND dc.constructor_id = r.constructor_id 
        AND dc.year = EXTRACT(YEAR FROM ra.date)::INTEGER
    WHERE dc.driver_id IS NULL
    ORDER BY year, driver_id, constructor_id;
END;
$$ LANGUAGE plpgsql;

-- Executar a função para popular a tabela driver_constructor
SELECT populate_driver_constructor();

-- Função para calcular distância entre coordenadas usando a fórmula de Haversine
-- Implementa o algoritmo de Haversine para cálculo preciso de distâncias geográficas
-- Útil para encontrar aeroportos próximos às cidades das corridas
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    R DECIMAL := 6371; -- Raio da Terra em km
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    -- Converter graus para radianos
    lat1 := lat1 * PI() / 180;
    lon1 := lon1 * PI() / 180;
    lat2 := lat2 * PI() / 180;
    lon2 := lon2 * PI() / 180;
    
    -- Diferenças
    dlat := lat2 - lat1;
    dlon := lon2 - lon1;
    
    -- Fórmula de Haversine
    a := SIN(dlat/2)^2 + COS(lat1) * COS(lat2) * SIN(dlon/2)^2;
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- View para otimizar a consulta de aeroportos próximos
-- Materializa a relação entre cidades brasileiras e seus aeroportos mais próximos
-- Filtra apenas aeroportos médios e grandes dentro de 100km
-- Otimiza consultas frequentes de logística e planejamento de viagens
CREATE OR REPLACE VIEW airport_proximity AS
WITH city_airports AS (
    SELECT 
        g.name AS city_name,
        g.lat AS city_lat,
        g.lng AS city_lng,
        a.iata_code AS airport_iata,
        a.name AS airport_name,
        a.city AS airport_city,
        a.type AS airport_type,
        calculate_distance(g.lat, g.lng, a.lat_deg, a.lng_deg) AS distance
    FROM geocities15k g
    CROSS JOIN airports a
    WHERE g.country = 'BR'
    AND a.type IN ('medium_airport', 'large_airport')
    AND calculate_distance(g.lat, g.lng, a.lat_deg, a.lng_deg) <= 100
)
SELECT 
    city_name,
    airport_iata,
    airport_name,
    airport_city,
    ROUND(distance::numeric, 2) AS distance_km,
    airport_type
FROM city_airports
ORDER BY city_name, distance_km;

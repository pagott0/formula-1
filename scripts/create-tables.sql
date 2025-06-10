-- Criação das tabelas principais do sistema F1
-- Este script assume que você já tem as tabelas padrão da F1 (drivers, constructors, races, etc.)
-- e adiciona as tabelas específicas do sistema

-- Tabela de usuários
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

-- Tabela de log de usuários
CREATE TABLE IF NOT EXISTS users_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de log de ações administrativas
CREATE TABLE IF NOT EXISTS admin_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    details JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de log de ações de escuderia
CREATE TABLE IF NOT EXISTS team_log (
    id SERIAL PRIMARY KEY,
    constructor_id INTEGER REFERENCES constructors(id),
    action VARCHAR(50) NOT NULL,
    details JSONB,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de associação entre pilotos e escuderias por ano
CREATE TABLE IF NOT EXISTS driver_constructor (
    driver_id INTEGER REFERENCES drivers(id),
    constructor_id INTEGER REFERENCES constructors(id),
    year INTEGER NOT NULL,
    PRIMARY KEY (driver_id, constructor_id, year)
);

-- Tabela de aeroportos (para o relatório de aeroportos próximos)
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    iata_code CHAR(3),
    icao_code CHAR(4),
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL
);

-- Tabela de cidades (para o relatório de aeroportos próximos)
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL
);

-- Função para criar usuário admin automaticamente
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (username, password, user_type, name)
        VALUES ('admin', 'admin', 'admin', 'Administrador');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para criar usuário de escuderia automaticamente
CREATE OR REPLACE FUNCTION create_constructor_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (username, password, user_type, name, constructor_id)
    VALUES (
        LOWER(NEW.constructorRef) || '_c',
        'escuderia',
        'team',
        NEW.name,
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para criar usuário de piloto automaticamente
CREATE OR REPLACE FUNCTION create_driver_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (username, password, user_type, name, driver_id)
    VALUES (
        LOWER(NEW.driverRef) || '_d',
        'piloto',
        'driver',
        CONCAT(NEW.forename, ' ', NEW.surname),
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para criar usuários automaticamente
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
    AND EXTRACT(YEAR FROM ra.date) = calculate_constructor_points.year;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular pontos de um piloto em uma temporada
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
    AND EXTRACT(YEAR FROM ra.date) = calculate_driver_points.year;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular a posição de uma escuderia em uma temporada
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
        WHERE EXTRACT(YEAR FROM ra.date) = calculate_constructor_position.year
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
        WHERE EXTRACT(YEAR FROM ra.date) = calculate_driver_position.year
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

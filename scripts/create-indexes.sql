-- Índices para otimização de consultas
-- Este script cria índices específicos para melhorar o desempenho das consultas do sistema

-- Índices para a tabela results
-- Melhora consultas de pontuação por piloto
CREATE INDEX IF NOT EXISTS idx_results_driver_id ON results(driver_id);

-- Melhora consultas de pontuação por escuderia
CREATE INDEX IF NOT EXISTS idx_results_constructor_id ON results(constructor_id);

-- Melhora consultas de resultados por status
CREATE INDEX IF NOT EXISTS idx_results_status_id ON results(status_id);

-- Melhora consultas de posição (vitórias, pódios)
CREATE INDEX IF NOT EXISTS idx_results_position ON results(position);

-- Índices para a tabela races
-- Melhora consultas por ano
CREATE INDEX IF NOT EXISTS idx_races_year ON races(year);

-- Melhora consultas por circuito
CREATE INDEX IF NOT EXISTS idx_races_circuit_id ON races(circuit_id);

-- Índice composto para consultas de resultados por ano
CREATE INDEX IF NOT EXISTS idx_results_race_year ON results(race_id, driver_id, constructor_id);

-- Índices para a tabela users
-- Melhora consultas de login
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Melhora consultas por tipo de usuário
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Melhora consultas de usuários por escuderia
CREATE INDEX IF NOT EXISTS idx_users_constructor_id ON users(constructor_id);

-- Melhora consultas de usuários por piloto
CREATE INDEX IF NOT EXISTS idx_users_driver_id ON users(driver_id);

-- Índices para a tabela driver_constructor
-- Melhora consultas de associação entre pilotos e escuderias
CREATE INDEX IF NOT EXISTS idx_driver_constructor_year ON driver_constructor(year);
CREATE INDEX IF NOT EXISTS idx_driver_constructor_driver ON driver_constructor(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_constructor_constructor ON driver_constructor(constructor_id);

-- Índice para busca de pilotos por nome
CREATE INDEX IF NOT EXISTS idx_drivers_name ON drivers(forename, surname);

-- Índice para busca de escuderias por nome
CREATE INDEX IF NOT EXISTS idx_constructors_name ON constructors(name);

-- Índice para logs de usuários
CREATE INDEX IF NOT EXISTS idx_users_log_user_id ON users_log(user_id);
CREATE INDEX IF NOT EXISTS idx_users_log_timestamp ON users_log(timestamp);

-- Índice para logs administrativos
CREATE INDEX IF NOT EXISTS idx_admin_log_action ON admin_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_log_table ON admin_log(table_name);

-- Índice para logs de escuderia
CREATE INDEX IF NOT EXISTS idx_team_log_constructor ON team_log(constructor_id);
CREATE INDEX IF NOT EXISTS idx_team_log_action ON team_log(action);

-- Comentários explicativos nos índices
COMMENT ON INDEX idx_results_driver_id IS 'Otimiza consultas de resultados por piloto';
COMMENT ON INDEX idx_results_constructor_id IS 'Otimiza consultas de resultados por escuderia';
COMMENT ON INDEX idx_results_status_id IS 'Otimiza consultas de resultados por status';
COMMENT ON INDEX idx_results_position IS 'Otimiza consultas de posição (vitórias, pódios)';
COMMENT ON INDEX idx_races_year IS 'Otimiza consultas por ano';
COMMENT ON INDEX idx_races_circuit_id IS 'Otimiza consultas por circuito';
COMMENT ON INDEX idx_results_race_year IS 'Otimiza consultas de resultados por ano';
COMMENT ON INDEX idx_users_username IS 'Otimiza consultas de login';
COMMENT ON INDEX idx_users_user_type IS 'Otimiza consultas por tipo de usuário';
COMMENT ON INDEX idx_users_constructor_id IS 'Otimiza consultas de usuários por escuderia';
COMMENT ON INDEX idx_users_driver_id IS 'Otimiza consultas de usuários por piloto';
COMMENT ON INDEX idx_driver_constructor_year IS 'Otimiza consultas de associação entre pilotos e escuderias por ano';
COMMENT ON INDEX idx_driver_constructor_driver IS 'Otimiza consultas de associação por piloto';
COMMENT ON INDEX idx_driver_constructor_constructor IS 'Otimiza consultas de associação por escuderia';
COMMENT ON INDEX idx_drivers_name IS 'Otimiza busca de pilotos por nome';
COMMENT ON INDEX idx_constructors_name IS 'Otimiza busca de escuderias por nome';

-- Índice para otimizar a consulta de aeroportos próximos
CREATE INDEX IF NOT EXISTS idx_airports_type_city ON airports (type, city);
CREATE INDEX IF NOT EXISTS idx_airports_coordinates ON airports (lat_deg, lng_deg);

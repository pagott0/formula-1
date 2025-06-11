// Tipos para autenticação
export interface User {
  id: number
  username: string
  password: string // Nunca retornar isso para o cliente
  user_type: "admin" | "team" | "driver"
  name: string
  constructor_id?: number
  driver_id?: number
  created_at: Date
  last_login?: Date
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: {
    id: number
    username: string
    user_type: "admin" | "team" | "driver"
    name: string
    constructor_id?: number
    driver_id?: number
  }
  message?: string
}

// Tipos para o dashboard do administrador
export interface AdminStats {
  totalDrivers: number
  totalConstructors: number
  totalSeasons: number
  currentYearRaces: number
  completedRaces: number
}

export interface Race {
  name: string
  laps: number
  time: string
  date: string
  circuit: string
}

export interface Constructor {
  name: string
  points: number
  nationality: string
}

export interface Driver {
  name: string
  points: number
  constructor: string
}

export interface RacePoints {
  name: string
  [constructor: string]: number | string
}

// Tipos para o dashboard da escuderia
export interface TeamStats {
  totalWins: number
  totalDrivers: number
  period: string
  name: string
}

export interface TeamDriver {
  name: string
  races: number
  wins: number
  points: number
}

export interface YearResult {
  year: number
  points: number
  races: number
  wins: number
}

export interface StatusResult {
  status: string
  count: number
}

// Tipos para o dashboard do piloto
export interface DriverStats {
  totalWins: number
  totalRaces: number
  period: string
  name: string
}

export interface CareerYear {
  year: number
  points: number
  wins: number
  races: number
}

export interface CircuitPerformance {
  circuit: string
  races: number
  wins: number
  avgPosition: number
  points: number
}

// Tipos para relatórios
export interface StatusReport {
  status: string
  count: number
}

export interface AirportReport {
  name: string
  city: string
  distance: number
  iata: string
  type: string
}

export interface ConstructorRacesReport {
  name: string
  totalDrivers: number
  totalRaces: number
  totalWins: number
  circuits: CircuitInfo[]
}

export interface CircuitInfo {
  name: string
  totalRaces: number
  lapStats: {
    min: number
    avg: number
    max: number
  }
  races: RaceInfo[]
}

export interface RaceInfo {
  year: number
  driverName: string
  laps: number
  time: string
}

export interface DriverWinsReport {
  name: string
  wins: number
  points: number
}

export interface PointsByYearReport {
  year: number
  points: number
  races: {
    name: string
    points: number
    position: number
    date: string
  }[]
}

// Tipos para ações administrativas
export interface CreateConstructorRequest {
  constructorRef: string
  name: string
  nationality: string
  url: string
}

export interface CreateDriverRequest {
  driverRef: string
  number: number
  code: string
  forename: string
  surname: string
  dob: string
  nationality: string
  constructorId: string
  year: number
}

export interface SearchDriverRequest {
  name: string
}

export interface SearchDriverResponse {
  drivers: {
    id: number
    name: string
    nationality: string
    dob: string
  }[]
}

export interface ImportDriversResponse {
  success: boolean
  count: number
  existingCount: number
  message: string
}

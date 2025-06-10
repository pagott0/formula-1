import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { DriverStats, CareerYear, CircuitPerformance } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const driverId = request.nextUrl.searchParams.get("driverId")

    if (!driverId) {
      return NextResponse.json({ error: "ID do piloto não fornecido" }, { status: 400 })
    }

    // Obter estatísticas do piloto
    const statsQuery = `
      SELECT 
        CONCAT(d.forename, ' ', d.surname) AS name,
        (SELECT COUNT(*) FROM results r WHERE r.driver_id = d.id AND r.position = 1) AS total_wins,
        COUNT(DISTINCT r.race_id) AS total_races,
        CONCAT(MIN(EXTRACT(YEAR FROM ra.date)), ' - ', MAX(EXTRACT(YEAR FROM ra.date))) AS period
      FROM drivers d
      JOIN results r ON r.driver_id = d.id
      JOIN races ra ON r.race_id = ra.id
      WHERE d.id = $1
      GROUP BY d.id, d.forename, d.surname
    `

    const statsResult = await query(statsQuery, [driverId])

    if (statsResult.rows.length === 0) {
      return NextResponse.json({ error: "Piloto não encontrado" }, { status: 404 })
    }

    const stats: DriverStats = {
      name: statsResult.rows[0].name,
      totalWins: Number.parseInt(statsResult.rows[0].total_wins),
      totalRaces: Number.parseInt(statsResult.rows[0].total_races),
      period: statsResult.rows[0].period,
    }

    // Obter carreira por ano
    const careerQuery = `
      SELECT 
        EXTRACT(YEAR FROM ra.date) AS year,
        SUM(r.points) AS points,
        SUM(CASE WHEN r.position = 1 THEN 1 ELSE 0 END) AS wins,
        COUNT(DISTINCT ra.id) AS races
      FROM drivers d
      JOIN results r ON r.driver_id = d.id
      JOIN races ra ON r.race_id = ra.id
      WHERE d.id = $1
      GROUP BY EXTRACT(YEAR FROM ra.date)
      ORDER BY year
    `

    const careerResult = await query(careerQuery, [driverId])
    const career: CareerYear[] = careerResult.rows.map((row) => ({
      year: Number.parseInt(row.year),
      points: Number.parseFloat(row.points),
      wins: Number.parseInt(row.wins),
      races: Number.parseInt(row.races),
    }))

    // Obter desempenho por circuito
    const circuitsQuery = `
      SELECT 
        c.name AS circuit,
        SUM(r.points) AS points,
        SUM(CASE WHEN r.position = 1 THEN 1 ELSE 0 END) AS wins,
        COUNT(DISTINCT ra.id) AS races
      FROM drivers d
      JOIN results r ON r.driver_id = d.id
      JOIN races ra ON r.race_id = ra.id
      JOIN circuits c ON ra.circuit_id = c.id
      WHERE d.id = $1
      GROUP BY c.name
      ORDER BY wins DESC, points DESC
      LIMIT 5
    `

    const circuitsResult = await query(circuitsQuery, [driverId])
    const circuits: CircuitPerformance[] = circuitsResult.rows.map((row) => ({
      circuit: row.circuit,
      points: Number.parseFloat(row.points),
      wins: Number.parseInt(row.wins),
      races: Number.parseInt(row.races),
    }))

    // Obter pontos por ano para o gráfico
    const pointsQuery = `
      SELECT 
        EXTRACT(YEAR FROM ra.date) AS year,
        SUM(r.points) AS points
      FROM drivers d
      JOIN results r ON r.driver_id = d.id
      JOIN races ra ON r.race_id = ra.id
      WHERE d.id = $1
      GROUP BY EXTRACT(YEAR FROM ra.date)
      ORDER BY year
    `

    const pointsResult = await query(pointsQuery, [driverId])
    const pointsByYear = pointsResult.rows.map((row) => ({
      year: Number.parseInt(row.year),
      points: Number.parseFloat(row.points),
    }))

    return NextResponse.json({
      stats,
      career,
      circuits,
      pointsByYear,
    })
  } catch (error) {
    console.error("Driver dashboard error:", error)
    return NextResponse.json({ error: "Erro ao carregar dados do dashboard" }, { status: 500 })
  }
}

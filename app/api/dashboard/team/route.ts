import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { TeamStats, TeamDriver, YearResult, StatusResult } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const constructorId = request.nextUrl.searchParams.get("constructorId")

    if (!constructorId) {
      return NextResponse.json({ error: "ID da escuderia não fornecido" }, { status: 400 })
    }

    // Obter estatísticas da escuderia
    const statsQuery = `
      SELECT 
        c.name,
        (SELECT COUNT(*) FROM results r WHERE r.constructor_id = c.id AND r.position = 1) AS total_wins,
        (SELECT COUNT(DISTINCT driver_id) FROM results r WHERE r.constructor_id = c.id) AS total_drivers,
        CONCAT(MIN(EXTRACT(YEAR FROM ra.date)), ' - ', MAX(EXTRACT(YEAR FROM ra.date))) AS period
      FROM constructors c
      JOIN results r ON r.constructor_id = c.id
      JOIN races ra ON r.race_id = ra.id
      WHERE c.id = $1
      GROUP BY c.id, c.name
    `

    const statsResult = await query(statsQuery, [constructorId])

    if (statsResult.rows.length === 0) {
      return NextResponse.json({ error: "Escuderia não encontrada" }, { status: 404 })
    }

    const stats: TeamStats = {
      name: statsResult.rows[0].name,
      totalWins: Number.parseInt(statsResult.rows[0].total_wins),
      totalDrivers: Number.parseInt(statsResult.rows[0].total_drivers),
      period: statsResult.rows[0].period,
    }

    // Obter pilotos da escuderia
    const driversQuery = `
      SELECT 
        CONCAT(d.forename, ' ', d.surname) AS name,
        COUNT(DISTINCT r.race_id) AS races,
        SUM(CASE WHEN r.position = 1 THEN 1 ELSE 0 END) AS wins,
        SUM(r.points) AS points
      FROM drivers d
      JOIN results r ON r.driver_id = d.id
      WHERE r.constructor_id = $1
      GROUP BY d.id, d.forename, d.surname
      ORDER BY wins DESC
      LIMIT 4
    `

    const driversResult = await query(driversQuery, [constructorId])
    const drivers: TeamDriver[] = driversResult.rows.map((row) => ({
      name: row.name,
      races: Number.parseInt(row.races),
      wins: Number.parseInt(row.wins),
      points: Number.parseFloat(row.points),
    }))

    // Obter resultados por ano
    const resultsQuery = `
      SELECT 
        EXTRACT(YEAR FROM ra.date) AS year,
        RANK() OVER (PARTITION BY EXTRACT(YEAR FROM ra.date) ORDER BY SUM(r.points) DESC) AS position,
        SUM(r.points) AS points
      FROM constructors c
      JOIN results r ON r.constructor_id = c.id
      JOIN races ra ON r.race_id = ra.id
      WHERE c.id = $1
      GROUP BY EXTRACT(YEAR FROM ra.date)
      ORDER BY year DESC
      LIMIT 5
    `

    const resultsResult = await query(resultsQuery, [constructorId])
    const results: YearResult[] = resultsResult.rows.map((row) => ({
      year: Number.parseInt(row.year),
      position: Number.parseInt(row.position),
      points: Number.parseFloat(row.points),
    }))

    // Obter status das corridas
    const statusQuery = `
      SELECT 
        s.status AS name,
        COUNT(*) AS value
      FROM results r
      JOIN status s ON r.status_id = s.id
      WHERE r.constructor_id = $1
      GROUP BY s.status
      ORDER BY value DESC
      LIMIT 4
    `

    const statusResult = await query(statusQuery, [constructorId])
    const status: StatusResult[] = statusResult.rows.map((row) => ({
      name: row.name,
      value: Number.parseInt(row.value),
    }))

    return NextResponse.json({
      stats,
      drivers,
      results,
      status,
    })
  } catch (error) {
    console.error("Team dashboard error:", error)
    return NextResponse.json({ error: "Erro ao carregar dados do dashboard" }, { status: 500 })
  }
}

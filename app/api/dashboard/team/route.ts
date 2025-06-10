import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { TeamStats, TeamDriver, YearResult, StatusResult } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const constructorName = request.nextUrl.searchParams.get("constructorName")
    const constructorIdResult = await query(`SELECT id FROM constructors WHERE LOWER(name) = LOWER($1)`, [constructorName])
    const constructorId = constructorIdResult.rows[0].id

    if (!constructorId) {
      return NextResponse.json({ error: "ID da escuderia não fornecido" }, { status: 400 })
    }

    // Obter estatísticas da escuderia
    const statsQuery = `
      SELECT 
        c.name,
        (SELECT COUNT(*) FROM results r WHERE r.constructor_id = c.id AND r.position = 1) AS total_wins,
        (SELECT COUNT(DISTINCT driver_id) FROM results r WHERE r.constructor_id = c.id) AS total_drivers,
        CONCAT(MIN(ra.year), ' - ', MAX(ra.year)) AS period
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
    const yearResultsQuery = `
      SELECT 
        ra.year,
        SUM(r.points) AS points,
        COUNT(DISTINCT ra.id) AS races,
        SUM(CASE WHEN r.position = 1 THEN 1 ELSE 0 END) AS wins
      FROM races ra
      JOIN results r ON r.race_id = ra.id
      WHERE r.constructor_id = $1
      GROUP BY ra.year
      ORDER BY ra.year DESC
      LIMIT 5
    `

    const yearResultsResult = await query(yearResultsQuery, [constructorId])
    const yearResults: YearResult[] = yearResultsResult.rows.map((row) => ({
      year: Number.parseInt(row.year),
      points: Number.parseFloat(row.points),
      races: Number.parseInt(row.races),
      wins: Number.parseInt(row.wins),
    }))

    // Obter resultados por status
    const statusResultsQuery = `
      SELECT 
        s.status,
        COUNT(*) AS count
      FROM results r
      JOIN status s ON r.status_id = s.id
      WHERE r.constructor_id = $1
      GROUP BY s.status
      ORDER BY count DESC
    `

    const statusResultsResult = await query(statusResultsQuery, [constructorId])
    const statusResults: StatusResult[] = statusResultsResult.rows.map((row) => ({
      status: row.status,
      count: Number.parseInt(row.count),
    }))

    return NextResponse.json({
      stats,
      drivers,
      yearResults,
      statusResults,
    })
  } catch (error) {
    console.error("Team dashboard error:", error)
    return NextResponse.json({ error: "Erro ao carregar dados do dashboard" }, { status: 500 })
  }
}

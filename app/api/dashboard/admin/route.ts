import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { AdminStats, Race, Constructor, Driver, RacePoints } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Obter estatísticas gerais - deixamos a query em 2024 pois 2025 nao ha dados
    // const statsResult = await query(`
    //   SELECT
    //   (SELECT COUNT(*) FROM drivers) AS total_drivers,
    //   (SELECT COUNT(*) FROM constructors) AS total_constructors,
    //   (SELECT COUNT(DISTINCT year) FROM races) AS total_seasons,
    //   (SELECT COUNT(*) FROM races WHERE year = date_part('year', CURRENT_DATE)) AS current_year_races,
    //   (SELECT COUNT(*) FROM races WHERE date < CURRENT_DATE AND year = date_part('year', CURRENT_DATE)) AS completed_races
    // `)
    const statsResult = await query(`
      SELECT
      (SELECT COUNT(*) FROM drivers) AS total_drivers,
      (SELECT COUNT(*) FROM constructors) AS total_constructors,
      (SELECT COUNT(DISTINCT year) FROM races) AS total_seasons,
      (SELECT COUNT(*) FROM races WHERE year = 2024) AS current_year_races,
      (SELECT COUNT(*) FROM races WHERE date < CURRENT_DATE AND year = 2024) AS completed_races
    `)


    const stats: AdminStats = {
      totalDrivers: Number.parseInt(statsResult.rows[0].total_drivers),
      totalConstructors: Number.parseInt(statsResult.rows[0].total_constructors),
      totalSeasons: Number.parseInt(statsResult.rows[0].total_seasons),
      currentYearRaces: Number.parseInt(statsResult.rows[0].current_year_races),
      completedRaces: Number.parseInt(statsResult.rows[0].completed_races),
    }

    // Deixamos a query em 2024 pois 2025 nao ha dados
    // const racesResult = await query(`
    //   SELECT 
    //     r.name, 
    //     NULL AS laps, 
    //     (SELECT MIN(fastest_lap_time) FROM results res WHERE res.race_id = r.id) AS time,
    //     r.date,
    //     c.name AS circuit
    //   FROM races r
    //   JOIN circuits c ON r.circuit_id = c.id
    //   WHERE r.year = date_part('year', CURRENT_DATE)
    //   ORDER BY r.date
    //   LIMIT 5
    // `)
    // Obter corridas do ano atual

    const racesResult = await query(`
          SELECT 
            r.name,
            MAX(res.laps) AS laps,
            (SELECT MIN(fastest_lap_time) FROM results res2 WHERE res2.race_id = r.id) AS fastest_lap_time,
            r.date,
            c.name AS circuit,
            -- Tempo total da corrida (tempo do vencedor)
            (SELECT res3.time 
             FROM results res3 
             WHERE res3.race_id = r.id 
               AND res3.position = 1 
             ) AS race_time
          FROM races r
          JOIN circuits c ON r.circuit_id = c.id
          LEFT JOIN results res ON res.race_id = r.id
          WHERE r.year = 2024
          GROUP BY r.id, r.name, r.date, c.name
          ORDER BY r.date
        `)

    const races: Race[] = racesResult.rows.map((row) => ({
      name: row.name,
      laps: row.laps || 0,
      time: row.race_time || "N/A",
      date: new Date(row.date).toLocaleDateString(),
      circuit: row.circuit,
    }))

    // Obter escuderias do ano atual com pontuação
    // const constructorsResult = await query(`
    //   SELECT 
    //     c.name, 
    //     SUM(r.points) AS points,
    //     c.nationality
    //   FROM constructors c
    //   JOIN results r ON r.constructor_id = c.id
    //   JOIN races ra ON r.race_id = ra.id
    //   WHERE ra.year = date_part('year', CURRENT_DATE)
    //   GROUP BY c.id, c.name, c.nationality
    //   ORDER BY points DESC
    // `)
    const constructorsResult = await query(`
      SELECT 
      c.name, 
      SUM(r.points) AS points,
      c.nationality
      FROM constructors c
      JOIN results r ON r.constructor_id = c.id
      JOIN races ra ON r.race_id = ra.id
      WHERE ra.year = 2024
      GROUP BY c.id, c.name, c.nationality
      ORDER BY points DESC
    `)

    const constructors: Constructor[] = constructorsResult.rows.map((row) => ({
      name: row.name,
      points: Number.parseFloat(row.points),
      nationality: row.nationality,
    }))

    // Obter pilotos do ano atual com pontuação
    const driversResult = await query(`
      SELECT 
      (d.forename || ' ' || d.surname) AS name, 
      SUM(r.points) AS points,
      c.name AS constructor
      FROM drivers d
      JOIN results r ON r.driver_id = d.id
      JOIN constructors c ON r.constructor_id = c.id
      JOIN races ra ON r.race_id = ra.id
      WHERE ra.year = 2024
      GROUP BY d.id, d.forename, d.surname, c.name
      ORDER BY points DESC
    `)

    //  const driversResult = await query(`
    //   SELECT 
    //     (d.forename || ' ' || d.surname) AS name, 
    //     SUM(r.points) AS points,
    //     c.name AS constructor
    //   FROM drivers d
    //   JOIN results r ON r.driver_id = d.id
    //   JOIN constructors c ON r.constructor_id = c.id
    //   JOIN races ra ON r.race_id = ra.id
    //   WHERE ra.year = date_part('year', CURRENT_DATE)
    //   GROUP BY d.id, d.forename, d.surname, c.name
    //   ORDER BY points DESC
    // `)

    const drivers: Driver[] = driversResult.rows.map((row) => ({
      name: row.name,
      points: Number.parseFloat(row.points),
      constructor: row.constructor,
    }))

    // Obter pontuação por corrida para as principais equipes
    const racePointsResult = await query(`
      WITH top_constructors AS (
        SELECT 
          c.id, 
          c.name
        FROM constructors c
        JOIN results r ON r.constructor_id = c.id
        JOIN races ra ON r.race_id = ra.id
        WHERE ra.year = date_part('year', CURRENT_DATE)
        GROUP BY c.id, c.name
        ORDER BY SUM(r.points) DESC
      )
      SELECT 
        ra.name,
        tc.name AS constructor_name,
        SUM(r.points) AS points
      FROM races ra
      JOIN results r ON r.race_id = ra.id
      JOIN top_constructors tc ON r.constructor_id = tc.id
      WHERE ra.year = date_part('year', CURRENT_DATE)
      GROUP BY ra.id, ra.name, tc.name
      ORDER BY ra.date
    `)

    // Transformar os resultados em um formato adequado para o gráfico
    const racePointsMap = new Map<string, RacePoints>()

    racePointsResult.rows.forEach((row) => {
      const raceName = row.name
      const constructorName = row.constructor_name
      const points = Number.parseFloat(row.points)

      if (!racePointsMap.has(raceName)) {
        racePointsMap.set(raceName, { name: raceName })
      }

      const raceData = racePointsMap.get(raceName)!
      raceData[constructorName] = points
    })

    const racePoints: RacePoints[] = Array.from(racePointsMap.values())

    return NextResponse.json({
      stats,
      races,
      constructors,
      drivers,
      racePoints,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar dados do dashboard" }, { status: 500 })
  }
}
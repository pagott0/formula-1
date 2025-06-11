import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { ConstructorRacesReport, CircuitInfo, RaceInfo } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Relatório 3: Escuderias e corridas
    const constructorsQuery = `
      WITH constructor_stats AS (
        SELECT 
          c.id,
          c.name,
          COUNT(DISTINCT r.driver_id) AS total_drivers,
          COUNT(DISTINCT r.race_id) AS total_races,
          SUM(CASE WHEN r.position = 1 THEN 1 ELSE 0 END) AS total_wins
        FROM constructors c
        LEFT JOIN results r ON r.constructor_id = c.id
        GROUP BY c.id, c.name
      )
      SELECT * FROM constructor_stats
      ORDER BY name
    `

    const constructorsResult = await query(constructorsQuery)
    const constructorsReports: ConstructorRacesReport[] = []

    for (const row of constructorsResult.rows) {
      // Query para obter informações dos circuitos
      const circuitsQuery = `
        WITH circuit_stats AS (
          SELECT 
            ci.id,
            ci.name,
            COUNT(DISTINCT ra.id) as total_races,
            MIN(r.laps) as min_laps,
            ROUND(AVG(r.laps), 2) as avg_laps,
            MAX(r.laps) as max_laps
          FROM circuits ci
          JOIN races ra ON ra.circuit_id = ci.id
          JOIN results r ON r.race_id = ra.id
          WHERE r.constructor_id = $1
          GROUP BY ci.id, ci.name
        )
        SELECT 
          cs.name,
          cs.total_races,
          cs.min_laps,
          cs.avg_laps,
          cs.max_laps,
          json_agg(
            json_build_object(
              'year', ra.year,
              'driverName', CONCAT(d.forename, ' ', d.surname),
              'laps', r.laps,
              'time', CASE 
                WHEN r.time IS NOT NULL AND r.time != '' THEN r.time
                WHEN r.milliseconds IS NOT NULL THEN 
                  TO_CHAR(
                    (r.milliseconds || ' milliseconds')::interval,
                    'HH24:MI:SS.MS'
                  )
                ELSE 'N/A'
              END
            ) ORDER BY ra.year DESC, d.surname, d.forename
          ) as races
        FROM circuit_stats cs
        JOIN races ra ON ra.circuit_id = cs.id
        JOIN results r ON r.race_id = ra.id
        JOIN drivers d ON d.id = r.driver_id
        WHERE r.constructor_id = $1
        GROUP BY cs.name, cs.total_races, cs.min_laps, cs.avg_laps, cs.max_laps
        ORDER BY cs.name
      `

      const circuitsResult = await query(circuitsQuery, [row.id])
      const circuits: CircuitInfo[] = circuitsResult.rows.map((circuit) => ({
        name: circuit.name,
        totalRaces: Number.parseInt(circuit.total_races),
        lapStats: {
          min: Number.parseInt(circuit.min_laps),
          avg: Number.parseFloat(circuit.avg_laps),
          max: Number.parseInt(circuit.max_laps)
        },
        races: circuit.races.map((race: any) => ({
          year: Number.parseInt(race.year),
          driverName: race.driverName,
          laps: Number.parseInt(race.laps),
          time: race.time
        }))
      }))

      constructorsReports.push({
        name: row.name,
        totalDrivers: Number.parseInt(row.total_drivers),
        totalRaces: Number.parseInt(row.total_races),
        totalWins: Number.parseInt(row.total_wins),
        circuits
      })
    }

    return NextResponse.json({
      data: constructorsReports,
    })
  } catch (error) {
    console.error("Constructors races report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { ConstructorRacesReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Relatório 3: Escuderias e corridas
    const constructorsQuery = `
      SELECT 
        c.name,
        (SELECT COUNT(DISTINCT driver_id) FROM results WHERE constructor_id = c.id) AS drivers,
        COUNT(DISTINCT r.race_id) AS races,
        SUM(CASE WHEN r.position = 1 THEN 1 ELSE 0 END) AS wins
      FROM constructors c
      LEFT JOIN results r ON r.constructor_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `

    const constructorsResult = await query(constructorsQuery)
    const constructorsReports: ConstructorRacesReport[] = constructorsResult.rows.map((row) => ({
      name: row.name,
      drivers: Number.parseInt(row.drivers),
      races: Number.parseInt(row.races),
      wins: Number.parseInt(row.wins),
    }))

    return NextResponse.json({
      title: "Escuderias e corridas",
      description: "Lista todas as escuderias cadastradas com a quantidade de pilotos e detalhes sobre corridas.",
      data: constructorsReports,
    })
  } catch (error) {
    console.error("Constructors races report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}

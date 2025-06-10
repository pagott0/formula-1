import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { PointsByYearReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const driverId = request.nextUrl.searchParams.get("driverId")

    if (!driverId) {
      return NextResponse.json({ error: "ID do piloto não fornecido" }, { status: 400 })
    }

    // Relatório 6: Pontos por ano
    const pointsQuery = `
      SELECT 
        EXTRACT(YEAR FROM ra.date) AS year,
        SUM(r.points) AS points
      FROM results r
      JOIN races ra ON r.race_id = ra.id
      WHERE r.driver_id = $1
      GROUP BY EXTRACT(YEAR FROM ra.date)
      ORDER BY year
    `

    const pointsResult = await query(pointsQuery, [driverId])
    const pointsReports: PointsByYearReport[] = pointsResult.rows.map((row) => ({
      year: Number.parseInt(row.year),
      points: Number.parseFloat(row.points),
    }))

    // Obter o nome do piloto
    const driverQuery = `SELECT CONCAT(forename, ' ', surname) AS name FROM drivers WHERE id = $1`
    const driverResult = await query(driverQuery, [driverId])
    const driverName = driverResult.rows[0]?.name || "Piloto"

    return NextResponse.json({
      title: `Pontos por ano - ${driverName}`,
      description: "Consulta a quantidade total de pontos obtidos por ano de participação na Fórmula 1.",
      data: pointsReports,
    })
  } catch (error) {
    console.error("Points by year report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}

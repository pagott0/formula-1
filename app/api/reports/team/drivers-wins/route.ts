import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { DriverWinsReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const constructorId = request.nextUrl.searchParams.get("constructorId")

    if (!constructorId) {
      return NextResponse.json({ error: "ID da escuderia não fornecido" }, { status: 400 })
    }

    // Relatório 4: Pilotos da escuderia
    const driversQuery = `
      SELECT 
        CONCAT(d.forename, ' ', d.surname) AS name,
        SUM(CASE WHEN r.position = 1 THEN 1 ELSE 0 END) AS wins,
        SUM(r.points) AS points
      FROM drivers d
      JOIN results r ON r.driver_id = d.id
      WHERE r.constructor_id = $1
      GROUP BY d.id, d.forename, d.surname
      ORDER BY wins DESC, points DESC
    `

    const driversResult = await query(driversQuery, [constructorId])
    const driversReports: DriverWinsReport[] = driversResult.rows.map((row) => ({
      name: row.name,
      wins: Number.parseInt(row.wins),
      points: Number.parseFloat(row.points),
    }))

    // Obter o nome da escuderia
    const constructorQuery = `SELECT name FROM constructors WHERE id = $1`
    const constructorResult = await query(constructorQuery, [constructorId])
    const constructorName = constructorResult.rows[0]?.name || "Escuderia"

    return NextResponse.json({
      title: `Pilotos da escuderia ${constructorName}`,
      description: "Lista os pilotos da escuderia e a quantidade de vitórias de cada um.",
      data: driversReports,
    })
  } catch (error) {
    console.error("Drivers wins report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}

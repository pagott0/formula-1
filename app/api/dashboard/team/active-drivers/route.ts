import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const constructorName = request.nextUrl.searchParams.get("constructorName")

    if (!constructorName) {
      return NextResponse.json({ error: "Nome da escuderia não fornecido" }, { status: 400 })
    }

    const constructorIdResult = await query(`SELECT id FROM constructors WHERE LOWER(name) = LOWER($1)`, [constructorName])
    const constructorId = constructorIdResult.rows[0].id

    if (!constructorId) {
      return NextResponse.json({ error: "Escuderia não encontrada" }, { status: 404 })
    }

    console.log(constructorName, constructorId)

    // Get count of active drivers for the team
    const activeDriversQuery = `
      SELECT COUNT(DISTINCT d.id) as active_drivers
      FROM drivers d
      JOIN results r ON r.driver_id = d.id
      JOIN races ra ON r.race_id = ra.id
      WHERE r.constructor_id = $1
      AND ra.year = EXTRACT(YEAR FROM CURRENT_DATE) - 1
    `

    console.log(activeDriversQuery)

    const activeDriversResult = await query(activeDriversQuery, [constructorId])
    const activeDrivers = Number.parseInt(activeDriversResult.rows[0].active_drivers)
    console.log(activeDrivers)
    return NextResponse.json({ activeDrivers })
  } catch (error) {
    console.error("Active drivers count error:", error)
    return NextResponse.json({ error: "Erro ao buscar número de pilotos ativos" }, { status: 500 })
  }
} 
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const driverName = request.nextUrl.searchParams.get("driverName")

    if (!driverName) {
      return NextResponse.json({ error: "Nome do piloto não fornecido" }, { status: 400 })
    }

    // Get the team name for the driver in the current year
    const teamQuery = `
      SELECT DISTINCT c.name as team_name, ra.date
      FROM constructors c
      JOIN results r ON r.constructor_id = c.id
      JOIN drivers d ON r.driver_id = d.id
      JOIN races ra ON r.race_id = ra.id
      WHERE CONCAT(d.forename, ' ', d.surname) = $1
      AND ra.year = EXTRACT(YEAR FROM CURRENT_DATE) - 1
      ORDER BY ra.date DESC
      LIMIT 1
    `

    const teamResult = await query(teamQuery, [driverName])
    
    if (teamResult.rows.length === 0) {
      return NextResponse.json({ error: "Piloto não encontrado ou sem escuderia" }, { status: 404 })
    }

    const teamName = teamResult.rows[0].team_name

    return NextResponse.json({ teamName })
  } catch (error) {
    console.error("Driver team error:", error)
    return NextResponse.json({ error: "Erro ao buscar escuderia do piloto" }, { status: 500 })
  }
} 
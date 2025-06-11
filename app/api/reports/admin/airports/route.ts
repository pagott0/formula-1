import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { AirportReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city")

    if (!city) {
      return NextResponse.json({ error: "Cidade não fornecida" }, { status: 400 })
    }

    const airportsQuery = `
      SELECT 
        city_name,
        airport_iata,
        airport_name,
        airport_city,
        distance_km,
        airport_type
      FROM airport_proximity
      WHERE city_name ILIKE $1
      ORDER BY distance_km
    `

    const airportsResult = await query(airportsQuery, [`%${city}%`])
    const airportsReports: AirportReport[] = airportsResult.rows.map((row) => ({
      name: row.airport_name,
      city: row.airport_city,
      distance: Number.parseFloat(row.distance_km),
      iata: row.airport_iata,
      type: row.airport_type
    }))

    return NextResponse.json({
      title: `Aeroportos próximos a ${city}`,
      description: `Apresenta aeroportos brasileiros a até 100 Km de ${city}.`,
      data: airportsReports,
    })
  } catch (error) {
    console.error("Airports report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { AirportReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get("city")

    if (!city) {
      return NextResponse.json({ error: "Cidade não fornecida" }, { status: 400 })
    }

    // Relatório 2: Aeroportos próximos a cidades
    // Esta query assume que você tem uma tabela de aeroportos com coordenadas geográficas
    // e usa a função de distância do PostgreSQL para calcular a distância entre pontos
    const airportsQuery = `
      SELECT 
        a.name,
        a.city,
        ST_Distance(
          ST_MakePoint(a.lng_deg, a.lat_deg)::geography,
          (SELECT ST_MakePoint(lng_deg, lat_deg)::geography FROM geocities15k WHERE name = $1)
        ) / 1000 AS distance
      FROM airports a
      WHERE ST_Distance(
        ST_MakePoint(a.lng_deg, a.lat_deg)::geography,
        (SELECT ST_MakePoint(lng_deg, lat_deg)::geography FROM geocities15k WHERE name = $1)
      ) / 1000 <= 100
      ORDER BY distance
    `
    console.log(airportsQuery)

    const airportsResult = await query(airportsQuery, [city])
    const airportsReports: AirportReport[] = airportsResult.rows.map((row) => ({
      name: row.name,
      city: row.city,
      distance: Number.parseFloat(row.distance),
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

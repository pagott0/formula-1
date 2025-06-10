import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { SearchDriverResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get("name")

    if (!name) {
      return NextResponse.json({
        drivers: [],
      } as SearchDriverResponse)
    }

    // Buscar pilotos pelo nome
    const searchQuery = `
      SELECT 
        id,
        CONCAT(forename, ' ', surname) AS name,
        nationality,
        dob
      FROM drivers
      WHERE 
        LOWER(forename) LIKE LOWER($1) OR 
        LOWER(surname) LIKE LOWER($1) OR
        LOWER(CONCAT(forename, ' ', surname)) LIKE LOWER($1)
      ORDER BY surname, forename
      LIMIT 10
    `

    const searchResult = await query(searchQuery, [`%${name}%`])

    const drivers = searchResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      nationality: row.nationality,
      dob: new Date(row.dob).toLocaleDateString(),
    }))

    return NextResponse.json({
      drivers,
    } as SearchDriverResponse)
  } catch (error) {
    console.error("Search driver error:", error)
    return NextResponse.json(
      {
        drivers: [],
      } as SearchDriverResponse,
      { status: 500 },
    )
  }
}

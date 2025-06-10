import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { SearchDriverResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get("name")
    const constructorName = request.nextUrl.searchParams.get("constructorName")
    console.log(constructorName)

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
        date_of_birth
      FROM drivers
      WHERE 
        LOWER(forename) LIKE LOWER($1) OR 
        LOWER(surname) LIKE LOWER($1) OR
        LOWER(CONCAT(forename, ' ', surname)) LIKE LOWER($1)
      ORDER BY surname, forename
    `

    
    const searchResult = await query(searchQuery, [`%${name}%`])
    const driversOnConstructor = []
    // check if there is at least one line on table races with constructorId and driver
    const constructorIdResult = await query(`SELECT id FROM constructors WHERE LOWER(name) = LOWER($1)`, [constructorName])
    const constructorId = constructorIdResult.rows[0].id
    for(const driver of searchResult.rows) {
      const checkQuery = `
        SELECT COUNT(*) FROM results WHERE constructor_id = $1 AND driver_id = $2
      `
      const checkResult = await query(checkQuery, [constructorId, driver.id])
      console.log(checkResult.rows[0])
      if (checkResult.rows[0].count > 0) {
        driversOnConstructor.push(driver)
      }
    }
    console.log(driversOnConstructor)
    const drivers = driversOnConstructor.map((row) => ({
      id: row.id,
      name: row.name,
      nationality: row.nationality,
      dob: new Date(row.date_of_birth).toLocaleDateString(),
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

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const constructorsQuery = `
      SELECT id, name
      FROM constructors
      ORDER BY name
    `

    const constructorsResult = await query(constructorsQuery)
    const constructors = constructorsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
    }))

    return NextResponse.json({ constructors })
  } catch (error) {
    console.error("Get constructors error:", error)
    return NextResponse.json({ error: "Erro ao buscar escuderias" }, { status: 500 })
  }
} 
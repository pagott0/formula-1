import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { StatusReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const constructorId = request.nextUrl.searchParams.get("constructorId")

    if (!constructorId) {
      return NextResponse.json({ error: "ID da escuderia não fornecido" }, { status: 400 })
    }

    // Relatório 5: Resultados por status para a escuderia
    const statusQuery = `
      SELECT 
        s.status,
        COUNT(*) AS count
      FROM results r
      JOIN status s ON r.status_id = s.id
      WHERE r.constructor_id = $1
      GROUP BY s.status
      ORDER BY count DESC
    `

    const statusResult = await query(statusQuery, [constructorId])
    const statusReports: StatusReport[] = statusResult.rows.map((row) => ({
      status: row.status,
      count: Number.parseInt(row.count),
    }))

    // Obter o nome da escuderia
    const constructorQuery = `SELECT name FROM constructors WHERE id = $1`
    const constructorResult = await query(constructorQuery, [constructorId])
    const constructorName = constructorResult.rows[0]?.name || "Escuderia"

    return NextResponse.json({
      title: `Resultados por status - ${constructorName}`,
      description: "Lista a quantidade de resultados por cada status, limitadas ao escopo da escuderia.",
      data: statusReports,
    })
  } catch (error) {
    console.error("Team status results report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { StatusReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Relatório 1: Quantidade de resultados por status
    const statusQuery = `
      SELECT 
        s.status,
        COUNT(*) AS count
      FROM results r
      JOIN status s ON r.status_id = s.id
      GROUP BY s.status
      ORDER BY count DESC
    `

    const statusResult = await query(statusQuery)
    const statusReports: StatusReport[] = statusResult.rows.map((row) => ({
      status: row.status,
      count: Number.parseInt(row.count),
    }))

    return NextResponse.json({
      title: "Quantidade de resultados por status",
      description: "Indica a quantidade de resultados por cada status, apresentando o nome do status e sua contagem.",
      data: statusReports,
    })
  } catch (error) {
    console.error("Status results report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}

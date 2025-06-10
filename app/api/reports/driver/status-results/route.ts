import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { StatusReport } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const driverId = request.nextUrl.searchParams.get("driverId")

    if (!driverId) {
      return NextResponse.json({ error: "ID do piloto não fornecido" }, { status: 400 })
    }

    // Relatório 7: Resultados por status para o piloto
    const statusQuery = `
      SELECT 
        s.status,
        COUNT(*) AS count
      FROM results r
      JOIN status s ON r.status_id = s.id
      WHERE r.driver_id = $1
      GROUP BY s.status
      ORDER BY count DESC
    `

    const statusResult = await query(statusQuery, [driverId])
    const statusReports: StatusReport[] = statusResult.rows.map((row) => ({
      status: row.status,
      count: Number.parseInt(row.count),
    }))

    // Obter o nome do piloto
    const driverQuery = `SELECT CONCAT(forename, ' ', surname) AS name FROM drivers WHERE id = $1`
    const driverResult = await query(driverQuery, [driverId])
    const driverName = driverResult.rows[0]?.name || "Piloto"

    return NextResponse.json({
      title: `Resultados por status - ${driverName}`,
      description: "Lista a quantidade de resultados por cada status nas corridas em que o piloto participou.",
      data: statusReports,
    })
  } catch (error) {
    console.error("Driver status results report error:", error)
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { withTransaction } from "@/lib/database"
import type { ImportDriversResponse } from "@/lib/types"
import { parse } from "csv-parse/sync"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const constructorId = formData.get("constructorId") as string

    if (!file || !constructorId) {
      return NextResponse.json(
        {
          success: false,
          count: 0,
          message: "Arquivo ou ID da escuderia não fornecido",
        } as ImportDriversResponse,
        { status: 400 },
      )
    }

    // Ler o conteúdo do arquivo
    const fileContent = await file.text()

    // Parsear o CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (records.length === 0) {
      return NextResponse.json({
        success: false,
        count: 0,
        message: "Nenhum registro encontrado no arquivo",
      } as ImportDriversResponse)
    }

    // Importar os pilotos usando uma transação
    const result = await withTransaction(async (client) => {
      let importedCount = 0
      const errors = []

      for (const record of records) {
        try {
          // Verificar se o piloto já existe
          const checkQuery = `SELECT id FROM drivers WHERE driverRef = $1`
          const checkResult = await client.query(checkQuery, [record.driverRef])

          let driverId

          if (checkResult.rows.length > 0) {
            // Piloto já existe, usar o ID existente
            driverId = checkResult.rows[0].id
          } else {
            // Inserir novo piloto
            const insertQuery = `
              INSERT INTO drivers (driverRef, number, code, forename, surname, dob, nationality)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING id
            `

            const insertResult = await client.query(insertQuery, [
              record.driverRef,
              record.number,
              record.code,
              record.forename,
              record.surname,
              record.dob,
              record.nationality,
            ])

            driverId = insertResult.rows[0].id
          }

          // Associar o piloto à escuderia (se ainda não estiver associado)
          const associateQuery = `
            INSERT INTO driver_constructor (driver_id, constructor_id, year)
            VALUES ($1, $2, EXTRACT(YEAR FROM CURRENT_DATE))
            ON CONFLICT (driver_id, constructor_id, year) DO NOTHING
          `

          await client.query(associateQuery, [driverId, constructorId])

          importedCount++
        } catch (err) {
          errors.push({
            record: record.driverRef,
            error: err.message,
          })
        }
      }

      // Registrar a ação no log
      const logQuery = `
        INSERT INTO team_log (constructor_id, action, details)
        VALUES ($1, 'import_drivers', $2)
      `

      await client.query(logQuery, [constructorId, JSON.stringify({ count: importedCount, errors: errors.length })])

      return { importedCount, errors }
    })

    return NextResponse.json({
      success: true,
      count: result.importedCount,
      message: `${result.importedCount} pilotos importados com sucesso. ${result.errors.length} erros.`,
    } as ImportDriversResponse)
  } catch (error) {
    console.error("Import drivers error:", error)
    return NextResponse.json(
      {
        success: false,
        count: 0,
        message: "Erro ao importar pilotos",
      } as ImportDriversResponse,
      { status: 500 },
    )
  }
}

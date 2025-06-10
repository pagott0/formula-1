import { type NextRequest, NextResponse } from "next/server"
import { query, withTransaction } from "@/lib/database"
import type { CreateDriverRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { driverRef, number, code, forename, surname, dob, nationality } =
      (await request.json()) as CreateDriverRequest

    // Verificar se já existe um piloto com o mesmo driverRef
    const checkQuery = `SELECT id FROM drivers WHERE ref = $1`
    const checkResult = await query(checkQuery, [driverRef])

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Já existe um piloto com esta referência",
        },
        { status: 400 },
      )
    }

    // Inserir o novo piloto usando uma transação
    const result = await withTransaction(async (client) => {
      // Inserir na tabela drivers
      const insertQuery = `
        INSERT INTO drivers (ref, number, code, forename, surname, dob, nationality)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `

      const insertResult = await client.query(insertQuery, [
        driverRef,
        number,
        code,
        forename,
        surname,
        dob,
        nationality,
      ])

      const driverId = insertResult.rows[0].id

      // Registrar a ação no log
      const logQuery = `
        INSERT INTO admin_log (action, table_name, record_id, details)
        VALUES ('create', 'drivers', $1, $2)
      `

      await client.query(logQuery, [
        driverId,
        JSON.stringify({ driverRef, number, code, forename, surname, nationality }),
      ])

      return { driverId }
    })

    return NextResponse.json({
      success: true,
      message: "Piloto cadastrado com sucesso",
      driverId: result.driverId,
    })
  } catch (error) {
    console.error("Create driver error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao cadastrar piloto",
      },
      { status: 500 },
    )
  }
}

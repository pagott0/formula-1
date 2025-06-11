import { type NextRequest, NextResponse } from "next/server"
import { query, withTransaction } from "@/lib/database"
import type { CreateDriverRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { driverRef, number, code, forename, surname, dob, nationality, constructorId, year } = (await request.json()) as CreateDriverRequest

    // Verificar se já existe um piloto com o mesmo driverRef
    const checkQuery = `SELECT id FROM drivers WHERE LOWER(ref) = LOWER($1)`
    const checkResult = await query(checkQuery, [driverRef])
    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "DRIVER ALREADY EXISTS",
        },
        { status: 400 },
      )
    }

    // Inserir o novo piloto usando uma transação
    const result = await withTransaction(async (client) => {
      // Inserir na tabela drivers
      const insertQuery = `
        INSERT INTO drivers (ref, number, code, forename, surname, date_of_birth, nationality)
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

      // Inserir na tabela driver_constructor
      const driverConstructorQuery = `
        INSERT INTO driver_constructor (driver_id, constructor_id, year)
        VALUES ($1, $2, $3)
      `
      await client.query(driverConstructorQuery, [driverId, constructorId, year])

      // Registrar a ação no log
      const logQuery = `
        INSERT INTO admin_log (action, table_name, record_id, details)
        VALUES ('create', 'drivers', $1, $2)
      `

      await client.query(logQuery, [
        driverId,
        JSON.stringify({ driverRef, number, code, forename, surname, nationality, constructorId, year }),
      ])

      return { driverId }
    })

    return NextResponse.json({
      success: true,
      message: "DRIVER CREATED",
      driverId: result.driverId,
    })
  } catch (error) {
    console.error("Create driver error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "ERROR CREATING DRIVER",
      },
      { status: 500 },
    )
  }
}

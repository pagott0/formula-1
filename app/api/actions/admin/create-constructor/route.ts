import { type NextRequest, NextResponse } from "next/server"
import { query, withTransaction } from "@/lib/database"
import type { CreateConstructorRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { constructorRef, name, nationality, url } = (await request.json()) as CreateConstructorRequest

    // Verificar se já existe uma escuderia com o mesmo constructorRef
    const checkQuery = `SELECT id FROM constructors WHERE ref = $1`
    const checkResult = await query(checkQuery, [constructorRef])

    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Já existe uma escuderia com esta referência",
        },
        { status: 400 },
      )
    }

    // Inserir a nova escuderia usando uma transação
    const result = await withTransaction(async (client) => {
      // Inserir na tabela constructors
      const insertQuery = `
        INSERT INTO constructors (ref, name, nationality, url)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `

      const insertResult = await client.query(insertQuery, [constructorRef, name, nationality, url])
      const constructorId = insertResult.rows[0].id

      // Registrar a ação no log
      const logQuery = `
        INSERT INTO admin_log (action, table_name, record_id, details)
        VALUES ('create', 'constructors', $1, $2)
      `

      await client.query(logQuery, [constructorId, JSON.stringify({ constructorRef, name, nationality })])

      return { constructorId }
    })

    return NextResponse.json({
      success: true,
      message: "Escuderia cadastrada com sucesso",
      constructorId: result.constructorId,
    })
  } catch (error) {
    console.error("Create constructor error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao cadastrar escuderia",
      },
      { status: 500 },
    )
  }
}

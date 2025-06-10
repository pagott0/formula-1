import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import type { LoginResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Verificar se o usuário existe
    const userResult = await sql`
      SELECT id, username, password, user_type, name, constructor_id, driver_id 
      FROM users 
      WHERE username = ${username}
    `

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário ou senha incorretos",
        } as LoginResponse,
        { status: 401 },
      )
    }

    const user = userResult.rows[0]

    // Verificar a senha
    const passwordMatch = password === user.password

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuário ou senha incorretos",
        } as LoginResponse,
        { status: 401 },
      )
    }

    // Registrar o login
    await sql`
      INSERT INTO users_log (user_id, action, ip_address)
      VALUES (${user.id}, 'login', ${request.headers.get("x-forwarded-for") || "unknown"})
    `

    // Atualizar o último login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`

    // Retornar os dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    } as LoginResponse)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar o login",
      } as LoginResponse,
      { status: 500 },
    )
  }
}

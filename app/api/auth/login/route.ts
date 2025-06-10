import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import type { LoginResponse } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Verificar se o usuário existe
    const userResult = await query(
      `SELECT id, username, password, user_type, name, constructor_id, driver_id 
       FROM users 
       WHERE username = $1`,
      [username]
    )

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
    await query(
      `INSERT INTO users_log (user_id, action, ip_address)
       VALUES ($1, 'login', $2)`,
      [user.id, request.headers.get("x-forwarded-for") || "unknown"]
    )

    // Atualizar o último login
    await query(
      `UPDATE users SET last_login = NOW() WHERE id = $1`,
      [user.id]
    )

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

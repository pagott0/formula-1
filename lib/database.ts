import { sql } from "@vercel/postgres"

// Função para executar queries SQL
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await sql.query(text, params || [])
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  }
}

// Função para executar transações
export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  // Para @vercel/postgres, usamos uma abordagem simplificada
  // Em produção, você pode implementar transações usando BEGIN/COMMIT/ROLLBACK
  try {
    await sql`BEGIN`
    const result = await callback(sql)
    await sql`COMMIT`
    return result
  } catch (error) {
    await sql`ROLLBACK`
    throw error
  }
}

// Função para verificar a conexão com o banco
export async function testConnection() {
  try {
    const res = await sql`SELECT NOW()`
    return { connected: true, timestamp: res.rows[0].now }
  } catch (error) {
    console.error("Database connection error:", error)
    return { connected: false, error }
  }
}

export default { query, withTransaction, testConnection }

import { Pool } from 'pg'

// Create a pooled connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: true
})

// Função para executar queries SQL
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params || [])
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
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Função para verificar a conexão com o banco
export async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()')
    return { connected: true, timestamp: res.rows[0].now }
  } catch (error) {
    console.error("Database connection error:", error)
    return { connected: false, error }
  }
}

export default { query, withTransaction, testConnection }

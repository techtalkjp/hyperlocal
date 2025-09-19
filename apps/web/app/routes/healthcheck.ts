import { db } from '@hyperlocal/db'
import { sql } from 'kysely'

export const loader = async () => {
  const ret = await sql<{
    now: string
  }>`SELECT CURRENT_TIMESTAMP as now`.execute(db)

  return Response.json({ status: 'ok', now: ret.rows[0]?.now })
}

import { db } from '@hyperlocal/db'
import { sql } from 'kysely'
import type { Route } from './+types/healthcheck'

export const loader = async ({ context }: Route.LoaderArgs) => {
  const ret = await sql<{
    now: string
  }>`SELECT CURRENT_TIMESTAMP as now`.execute(db)

  return Response.json({ status: 'ok', now: ret.rows[0]?.now })
}

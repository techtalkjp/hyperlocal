import { db } from '@hyperlocal/db'
import { sql } from 'kysely'
import type { HeadersFunction } from 'react-router'
import type { Route } from './+types/healthcheck'

export const headers: HeadersFunction = () => ({
  // cache for 30 days
  'Cache-Control':
    'public, max-age=60, s-maxage=2592000, stale-while-revalidate=2592000',
})

export const loader = async ({ context }: Route.LoaderArgs) => {
  const ret = await sql<{
    now: string
  }>`SELECT CURRENT_TIMESTAMP as now`.execute(db)

  return Response.json({ status: 'ok', now: ret.rows[0]?.now })
}

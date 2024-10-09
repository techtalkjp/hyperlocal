import { LibsqlDialect } from '@libsql/kysely-libsql'
import createDebug from 'debug'
import {
  CamelCasePlugin,
  DeduplicateJoinsPlugin,
  Kysely,
  ParseJSONResultsPlugin,
} from 'kysely'
import type { DB } from './schema'
export { sql } from 'kysely'
export type * from './types'

const debug = createDebug('app:db')

const getDatabaseConfig = () => {
  const url = process.env.DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN
  if (!url || !authToken) {
    throw new Error(
      'Missing required database configuration. Please check DATABASE_URL and TURSO_AUTH_TOKEN environment variables.',
    )
  }
  return { url, authToken }
}

export const db = new Kysely<DB>({
  dialect: new LibsqlDialect(getDatabaseConfig()),
  log: (event) =>
    debug([
      event.level,
      event.queryDurationMillis,
      event.query.sql,
      event.query.parameters,
    ]),
  plugins: [
    new CamelCasePlugin(),
    new ParseJSONResultsPlugin(),
    new DeduplicateJoinsPlugin(),
  ],
})

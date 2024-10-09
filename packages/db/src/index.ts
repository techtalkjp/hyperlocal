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

export const db = new Kysely<DB>({
  dialect: new LibsqlDialect({
    url: process.env.DATABASE_URL ?? '',
    authToken: process.env.TURSO_AUTH_TOKEN ?? '',
  }),
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

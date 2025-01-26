import { LibsqlDialect } from '@libsql/kysely-libsql'
import createDebug from 'debug'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import type { DB } from './schema'
export { sql } from 'kysely'
export type { Insertable, Selectable, Updateable } from 'kysely'
export type * from './types'
export type { DB }

const debug = createDebug('app:db')

export const db = new Kysely<DB>({
  dialect: new LibsqlDialect({
    url: process.env.DATABASE_URL ?? '',
    authToken: process.env.TURSO_AUTH_TOKEN ?? '',
  }),
  plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
  log: (event) => {
    debug({ sql: event.query.sql, parameters: event.query.parameters })
  },
})

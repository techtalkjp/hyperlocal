import { LibsqlDialect } from '@libsql/kysely-libsql'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import type { DB } from './schema'
export { sql } from 'kysely'
export type { Insertable, Selectable, Updateable } from 'kysely'
export type * from './types'
export type { DB }

// Query logging without the `debug` package: its Node implementation pulls
// node:tty into the bundle and kills the Cloudflare Workers runtime at boot.
const debugEnabled = (process.env.DEBUG ?? '')
  .split(',')
  .some((pattern) => pattern.trim() === 'app:db' || pattern.trim() === '*')

function debugQuery(event: { query: { sql: string; parameters: unknown } }) {
  if (debugEnabled) {
    console.debug({ sql: event.query.sql, parameters: event.query.parameters })
  }
}

export function createDb(url: string, authToken: string): Kysely<DB> {
  return new Kysely<DB>({
    dialect: new LibsqlDialect({
      url,
      authToken,
      concurrency: 0,
      fetch: fetch,
    }),
    plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
    log: (event) => {
      debugQuery(event)
    },
  })
}

let sharedDb: Kysely<DB> | undefined

export const db: Kysely<DB> = new Proxy({} as Kysely<DB>, {
  get: (_target, prop) => {
    // Lazily constructed on first use: module scope runs before request env
    // exists on Cloudflare Workers, and only Node consumers ever touch `db`.
    sharedDb ??= createDb(
      process.env.DATABASE_URL ?? '',
      process.env.TURSO_AUTH_TOKEN ?? '',
    )
    const value = Reflect.get(sharedDb, prop)
    return typeof value === 'function' ? value.bind(sharedDb) : value
  },
})

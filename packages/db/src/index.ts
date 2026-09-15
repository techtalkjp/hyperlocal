import type { D1Database } from '@cloudflare/workers-types'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import type { DB } from './schema'
export { sql } from 'kysely'
export type { Insertable, Selectable, Updateable } from 'kysely'
export type * from './types'
export * from './ids'
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
let d1Database: D1Database | undefined

// Worker起動時に1回呼ぶ (bindingは全リクエスト共通)。
// 未設定なら従来通り libsql (Turso/file) を使う。
export function setD1Database(binding: D1Database | undefined): void {
  if (binding && !d1Database) {
    d1Database = binding
  }
}

export const db: Kysely<DB> = new Proxy({} as Kysely<DB>, {
  get: (_target, prop) => {
    // Lazily constructed on first use: module scope runs before request env
    // exists on Cloudflare Workers, and only Node consumers ever touch `db`.
    if (!sharedDb) {
      sharedDb = d1Database
        ? new Kysely<DB>({
            dialect: new D1Dialect({ database: d1Database }),
            plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
          })
        : createDb(
            process.env.DATABASE_URL ?? '',
            process.env.TURSO_AUTH_TOKEN ?? '',
          )
    }
    const value = Reflect.get(sharedDb, prop)
    return typeof value === 'function' ? value.bind(sharedDb) : value
  },
})

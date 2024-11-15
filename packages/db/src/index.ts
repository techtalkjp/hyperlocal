import { LibsqlDialect } from '@libsql/kysely-libsql'
import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin } from 'kysely'
import { getSessionContext } from 'session-context'
import type { DB } from './schema'
export { sql } from 'kysely'
export type { Insertable, Selectable, Updateable } from 'kysely'
export type * from './types'
export type { DB }

export const getDb = () => {
  const store = getSessionContext<{
    db?: Kysely<DB>
    env: { DATABASE_URL: string; TURSO_AUTH_TOKEN: string }
  }>()
  if (!store.db) {
    store.db = new Kysely<DB>({
      dialect: new LibsqlDialect({
        url: store.env.DATABASE_URL ?? '',
        authToken: store.env.TURSO_AUTH_TOKEN ?? '',
      }),
      plugins: [new CamelCasePlugin(), new ParseJSONResultsPlugin()],
    })
  }
  return store.db
}

export const db = new Proxy<Kysely<DB>>({} as never, {
  get(_target: unknown, props: keyof Kysely<DB>) {
    const instance = getDb()
    const value = instance[props]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  },
})

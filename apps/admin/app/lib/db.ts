import type { DB } from '@hyperlocal/db'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import { Kysely } from 'kysely'

// better-auth用（snake_caseカラム名をそのまま使用）
export const authDb = new Kysely<DB>({
  dialect: new LibsqlDialect({
    url: process.env.DATABASE_URL ?? '',
    authToken: process.env.TURSO_AUTH_TOKEN ?? '',
  }),
})

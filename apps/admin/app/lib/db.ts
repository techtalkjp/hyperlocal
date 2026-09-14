import { createDb, type DB } from '@hyperlocal/db'
import { LibsqlDialect } from '@libsql/kysely-libsql'
import { Kysely } from 'kysely'
import type { AdminEnv } from './request-context'

function requireEnv(env: AdminEnv, key: keyof AdminEnv): string {
  const value = env[key]
  if (!value) {
    throw new Error(`${String(key)} is not set in the worker environment`)
  }
  return value
}

const dbCache = new Map<string, Kysely<DB>>()

function cachedDb(cacheKey: string, factory: () => Kysely<DB>): Kysely<DB> {
  const cached = dbCache.get(cacheKey)
  if (cached) {
    return cached
  }
  const db = factory()
  dbCache.set(cacheKey, db)
  return db
}

/** App database (camelCase-mapped). Thread the worker env from the loader. */
export function getDb(env: AdminEnv): Kysely<DB> {
  const url = requireEnv(env, 'DATABASE_URL')
  return cachedDb(`db:${url}`, () => createDb(url, env.TURSO_AUTH_TOKEN ?? ''))
}

// better-auth用（snake_caseカラム名をそのまま使用）
export function getAuthDb(env: AdminEnv): Kysely<DB> {
  const url = requireEnv(env, 'DATABASE_URL')
  return cachedDb(
    `auth:${url}`,
    () =>
      new Kysely<DB>({
        dialect: new LibsqlDialect({
          url,
          authToken: env.TURSO_AUTH_TOKEN ?? '',
        }),
      }),
  )
}

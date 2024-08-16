import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
export * from './schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

export const takeFirst = <T>(arr: T[]) => arr[0]
export const takeFirstOrThrow = <T>(arr: T[]) => {
  if (arr.length === 0) {
    throw new Error('No result found')
  }
  return arr[0]
}

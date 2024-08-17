import 'dotenv/config'
import type { Config } from 'drizzle-kit'

export default {
  schema: './app/services/db/schema.ts',
  out: './migrations',
  driver: 'turso',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  introspect: { casing: 'camel' },
  verbose: true,
  strict: true,
} satisfies Config

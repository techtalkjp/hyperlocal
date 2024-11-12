import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import fs from 'node:fs/promises'

dotenv.config()

const url = new URL(process.env.DATABASE_URL)
await fs.unlink(url.pathname)

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncUrl: process.env.TURSO_DATABASE_URL,
})

await client.sync()

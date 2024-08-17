import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  url: 'file:./data/dev.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncUrl: process.env.TURSO_DATABASE_URL,
  syncInterval: 60,
})

await client.sync()

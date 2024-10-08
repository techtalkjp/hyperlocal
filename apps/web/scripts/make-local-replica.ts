import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import fs from 'node:fs/promises'

dotenv.config()

const files = await fs.readdir('./data')
for (const file of files) {
  if (file.startsWith('dev.db')) {
    await fs.unlink(`./data/${file}`)
  }
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncUrl: process.env.TURSO_DATABASE_URL,
})

await client.sync()

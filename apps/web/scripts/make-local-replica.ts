import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import fs from 'node:fs/promises'

dotenv.config()
const config = {
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncUrl: process.env.TURSO_DATABASE_URL,
}

const url = new URL(config.url)
await fs.rm(url.pathname, { force: true })
await fs.rm(`${url.pathname}-client_wal_index`, { force: true })

console.log({ url: config.url, syncUrl: config.syncUrl })
const client = createClient(config)
const ret = await client.sync()
console.log(ret)

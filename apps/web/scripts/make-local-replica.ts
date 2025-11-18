import { createClient } from '@libsql/client'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import '~/services/env.server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../../..')
const replicaDbPath = path.join(projectRoot, 'data/production-replica.db')

const config = {
  url: `file:${replicaDbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncUrl: process.env.TURSO_DATABASE_URL,
}

// Remove existing replica and metadata files
await fs.rm(replicaDbPath, { force: true })
await fs.rm(`${replicaDbPath}-client_wal_index`, { force: true })
await fs.rm(`${replicaDbPath}-shm`, { force: true })
await fs.rm(`${replicaDbPath}-wal`, { force: true })

console.log('📥 Downloading production data from Turso...')
console.log(`   Source: ${config.syncUrl}`)
console.log(`   Target: ${replicaDbPath}\n`)

const client = createClient(config)
const ret = await client.sync()

console.log('✅ Production data downloaded successfully!')
console.log(`   Frames synced: ${ret?.frames_synced ?? 'unknown'}`)
console.log(`   Saved to: ${replicaDbPath}\n`)
console.log('💡 To use this data for development:')
console.log('   pnpm db:reset    # Copy production-replica.db → dev.db')

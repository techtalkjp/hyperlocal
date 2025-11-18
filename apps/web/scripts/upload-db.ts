import { createClient } from '@libsql/client'
import fs from 'node:fs/promises'
import '~/services/env.server'
import { put } from '~/services/r2.server'

const dbFilePath = new URL(process.env.DATABASE_URL).pathname

console.log('📊 Running ANALYZE to update query statistics...')
const client = createClient({
  url: process.env.DATABASE_URL,
})
await client.execute('ANALYZE')
console.log('✅ ANALYZE completed\n')

console.log('📤 Uploading database to R2...')
const dbFile = await fs.readFile(dbFilePath)
await put('db/hyperlocal.db', dbFile)
console.log('✅ Database uploaded successfully')

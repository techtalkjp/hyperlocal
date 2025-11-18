#!/usr/bin/env tsx
/**
 * Fix migration checksums in Turso production database
 *
 * This script calculates and updates checksums for migrations that have
 * empty checksums (which happens when migrations are applied directly to Turso
 * without using Prisma's migration system).
 */

import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_DIR = join(__dirname, '..')

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
}

function log(message: string, color?: keyof typeof colors) {
  const colorCode = color ? colors[color] : ''
  console.log(`${colorCode}${message}${colors.reset}`)
}

function error(message: string) {
  log(`❌ Error: ${message}`, 'red')
  process.exit(1)
}

function calculateChecksum(sql: string): string {
  return createHash('sha256').update(sql).digest('hex')
}

async function main() {
  log('🔧 Fixing migration checksums in Turso database...\n', 'blue')

  // 1. Load .env.production
  const envPath = join(DB_DIR, '.env.production')
  if (!existsSync(envPath)) {
    error(
      '.env.production not found\nPlease copy .env.production.example to .env.production and fill in your values',
    )
  }

  config({ path: envPath })

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    error(
      'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.production',
    )
  }

  // 2. Connect to Turso
  log(`🔌 Connecting to ${tursoUrl}...`, 'gray')
  const client = createClient({
    url: tursoUrl as string,
    authToken: tursoToken as string,
  })

  // 3. Get all migrations from database
  const migrationsResult = await client.execute(
    'SELECT id, migration_name, checksum FROM _prisma_migrations ORDER BY migration_name',
  )

  log(
    `📋 Found ${migrationsResult.rows.length} migration(s) in database\n`,
    'gray',
  )

  // 4. Get migration files directory
  const migrationsDir = join(DB_DIR, 'prisma/migrations')
  if (!existsSync(migrationsDir)) {
    error('prisma/migrations directory not found')
  }

  // 5. Fix checksums for migrations with empty checksum
  let fixedCount = 0
  for (const row of migrationsResult.rows) {
    const migrationName = row.migration_name as string
    const currentChecksum = row.checksum as string
    const id = row.id as string

    // Skip if checksum already exists
    if (currentChecksum && currentChecksum !== '') {
      log(`   ✓ ${migrationName} - checksum OK`, 'gray')
      continue
    }

    // Calculate correct checksum
    const sqlPath = join(migrationsDir, migrationName, 'migration.sql')
    if (!existsSync(sqlPath)) {
      log(
        `   ⚠ ${migrationName} - migration.sql not found, skipping`,
        'yellow',
      )
      continue
    }

    const sql = readFileSync(sqlPath, 'utf-8')
    const correctChecksum = calculateChecksum(sql)

    // Update checksum in database
    await client.execute({
      sql: 'UPDATE _prisma_migrations SET checksum = ? WHERE id = ?',
      args: [correctChecksum, id],
    })

    log(`   ✓ ${migrationName} - checksum updated`, 'green')
    fixedCount++
  }

  if (fixedCount === 0) {
    log('\n✅ All migration checksums are already correct!\n', 'green')
  } else {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'gray')
    log(`✅ Fixed ${fixedCount} migration checksum(s)!`, 'green')
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'gray')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

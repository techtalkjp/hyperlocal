#!/usr/bin/env tsx
/**
 * Apply Prisma migrations to Turso production database
 *
 * This script:
 * 1. Loads production environment variables from .env.production
 * 2. Connects to Turso database to check applied migrations
 * 3. Applies any pending migrations in order
 * 4. Records migration history
 */

import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
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

async function main() {
  log('📦 Applying migrations to Turso production database...\n', 'blue')

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

  // 3. Ensure _prisma_migrations table exists
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id TEXT PRIMARY KEY NOT NULL,
      checksum TEXT NOT NULL,
      finished_at DATETIME,
      migration_name TEXT NOT NULL,
      logs TEXT,
      rolled_back_at DATETIME,
      started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )
  `)

  // 4. Get applied migrations
  const appliedMigrationsResult = await client.execute(
    'SELECT migration_name FROM _prisma_migrations ORDER BY migration_name',
  )
  const appliedMigrations = new Set(
    appliedMigrationsResult.rows.map((row) => row.migration_name as string),
  )

  log(
    `📋 Found ${appliedMigrations.size} applied migration(s) in database\n`,
    'gray',
  )

  // 5. Get all migration directories
  const migrationsDir = join(DB_DIR, 'prisma/migrations')
  if (!existsSync(migrationsDir)) {
    error('prisma/migrations directory not found')
  }

  const allMigrations = readdirSync(migrationsDir)
    .filter(
      (name) =>
        name !== 'migration_lock.toml' &&
        existsSync(join(migrationsDir, name, 'migration.sql')),
    )
    .sort()

  log(
    `📂 Found ${allMigrations.length} total migration(s) in prisma/migrations\n`,
    'gray',
  )

  // 6. Find pending migrations
  const pendingMigrations = allMigrations.filter(
    (name) => !appliedMigrations.has(name),
  )

  if (pendingMigrations.length === 0) {
    log('✅ Database is up to date. No pending migrations.\n', 'green')
    return
  }

  log(
    `🔄 Applying ${pendingMigrations.length} pending migration(s)...\n`,
    'yellow',
  )

  // 7. Apply each pending migration
  for (const migrationName of pendingMigrations) {
    log(`   Applying migration: ${migrationName}`, 'blue')

    const sqlPath = join(migrationsDir, migrationName, 'migration.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    try {
      // Execute migration SQL
      await client.executeMultiple(sql)

      // Record in _prisma_migrations
      await client.execute({
        sql: `INSERT INTO _prisma_migrations (id, checksum, migration_name, logs, started_at, finished_at, applied_steps_count)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)`,
        args: [
          crypto.randomUUID(),
          '', // Checksum not critical for this use case
          migrationName,
          null,
        ],
      })

      log(`   ✓ Applied: ${migrationName}`, 'green')
    } catch (err) {
      log(`   ✗ Failed to apply migration: ${migrationName}`, 'red')
      log(
        `   Error: ${err instanceof Error ? err.message : String(err)}`,
        'red',
      )
      throw err
    }
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'gray')
  log(
    `✅ Successfully applied ${pendingMigrations.length} migration(s)!`,
    'green',
  )
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'gray')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { db, sql } from '@hyperlocal/db'
import fs from 'node:fs'
import path from 'node:path'

// Turso(DATABASE_URL) -> D1用SQLダンプ。SELECTのみ。
// 使い方: pnpm tsx src/scripts/export-sql.ts --out /tmp/d1dump
// 空のD1への初回投入用 ( plain INSERT )。FK順に tables 出力。
// localized_places は5000行ずつ分割。

const args = process.argv.slice(2)
const outDir = args[args.indexOf('--out') + 1]
if (!outDir) throw new Error('--out <dir> is required')
fs.mkdirSync(outDir, { recursive: true })

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

const lit = (v: unknown): string => {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`non-finite number: ${v}`)
    return String(v)
  }
  // JSON列はParseJSONResultsPluginでobject化されているため再stringify
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  return `'${s.replaceAll("'", "''")}'`
}

const dumpTable = async (table: string, orderBy: string, chunkSize = 0) => {
  const colRes = await sql`SELECT name FROM pragma_table_info(${table})`.execute(db)
  const cols = colRes.rows.map((r) => (r as Record<string, string>).name)
  let offset = 0
  let part = 0
  for (;;) {
    const limit = chunkSize || 1000000000
    const res = await sql`SELECT * FROM ${sql.table(table)} ORDER BY ${sql.raw(orderBy)} LIMIT ${limit} OFFSET ${offset}`.execute(db)
    const rows = res.rows as Record<string, unknown>[]
    if (rows.length === 0) break
    part++
    const lines = (rows as Record<string, unknown>[]).map((r) => {
      // kysely CamelCasePlugin済み (google_place_id -> googlePlaceId) の両対応
      const val = (c: string) => r[c] ?? r[camel(c)]
      return `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(', ')}) VALUES (${cols.map((c) => lit(val(c))).join(', ')});`
    })
    const name =
      chunkSize > 0 ? `${table}-${String(part).padStart(2, '0')}.sql` : `${table}.sql`
    fs.writeFileSync(path.join(outDir, name), `${lines.join('\n')}\n`)
    console.log(`  ${name}: ${rows.length} rows`)
    if (chunkSize === 0 || rows.length < chunkSize) break
    offset += rows.length
  }
}

// FK親 -> 子の順
await dumpTable('user', 'id')
await dumpTable('account', 'id')
await dumpTable('session', 'id')
await dumpTable('verification', 'identifier')
await dumpTable('places', 'id')
await dumpTable('place_listings', 'city_id, area_id, category_id, ranking_type, place_id')
await dumpTable('localized_places', 'city_id, area_id, category_id, ranking_type, place_id, language', 5000)
await dumpTable('area_articles', 'id')
console.log('done:', outDir)
process.exit(0)

import { DuckDBInstance } from '@duckdb/node-api'
import { Kysely, ParseJSONResultsPlugin } from 'kysely'
import { DuckDbDialect } from 'kysely-duckdb'
import { type Database, tableMappings } from './database-schema'

const dbPath = process.env.CRAWL_DATABASE_PATH ?? ':memory:'
const instance = await DuckDBInstance.create(dbPath).catch((error) => {
  throw new Error(
    `Failed to initialize DuckDB at "${dbPath}": ${error.message}`,
  )
})

export const db = new Kysely<Database>({
  dialect: new DuckDbDialect({
    database: instance,
    tableMappings,
  }),
  plugins: [new ParseJSONResultsPlugin()],
  // log: (params) =>
  //   console.dir(
  //     { sql: params.query.sql, parameters: params.query.parameters },
  //     { depth: null },
  //   ),
})

import duckdb from 'duckdb'
import { Kysely, ParseJSONResultsPlugin } from 'kysely'
import { DuckDbDialect } from 'kysely-duckdb'
import { type Database, tableMappings } from './database-schema'

export const db = new Kysely<Database>({
  dialect: new DuckDbDialect({
    database: new duckdb.Database(
      process.env.CRAWL_DATABASE_PATH ?? ':memory:',
    ),
    tableMappings,
  }),
  plugins: [new ParseJSONResultsPlugin()],
  // log: (params) =>
  //   console.dir(
  //     { sql: params.query.sql, parameters: params.query.parameters },
  //     { depth: null },
  //   ),
})

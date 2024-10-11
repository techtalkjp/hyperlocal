import duckdb from 'duckdb'
import { Kysely, ParseJSONResultsPlugin } from 'kysely'
import { DuckDbDialect } from 'kysely-duckdb'

interface Database {
  crawled_restaurants: {
    url: string
    area: string
    name: string
    rating: number
    reviewCount: number
    budgetDinner: string
    budgetLunch: string
    closedDay: string
    address: string
    features: Record<string, string>
  }
}

const db = new duckdb.Database(':memory:')
const duckdbDialect = new DuckDbDialect({
  database: db,
  tableMappings: {
    crawled_restaurants: `read_json('./storage/datasets/restaurant/*.json',
      columns={
        "url": "STRING",
        "area": "STRING",
        "name": "STRING",
        "rating": "DOUBLE",
        "reviewCount": "DOUBLE",
        "budgetDinner": "STRING",
        "budgetLunch": "STRING",
        "closedDay": "STRING",
        "address": "STRING",
        "features": "JSON"
      })`,
  },
})
export const kysely = new Kysely<Database>({
  dialect: duckdbDialect,
  plugins: [new ParseJSONResultsPlugin()],
})

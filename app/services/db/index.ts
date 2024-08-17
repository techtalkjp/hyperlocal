import { LibsqlDialect } from '@libsql/kysely-libsql'
import createDebug from 'debug'
import {
  CamelCasePlugin,
  DeduplicateJoinsPlugin,
  Kysely,
  ParseJSONResultsPlugin,
} from 'kysely'
import type { DB } from './types'

const debug = createDebug('app:db')

export const db = new Kysely<DB>({
  dialect: new LibsqlDialect({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
  log: (event) => debug(event),
  plugins: [
    new CamelCasePlugin(),
    new ParseJSONResultsPlugin(),
    new DeduplicateJoinsPlugin(),
  ],
})

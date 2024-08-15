import { sql } from 'drizzle-orm'
import { numeric, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const areas = sqliteTable('areas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  longitude: numeric('longitude').notNull(),
  latitude: numeric('latitude').notNull(),
  created_at: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

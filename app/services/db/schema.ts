import { sql } from 'drizzle-orm'
import { real, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import type { Place } from '../google-places'

export const areas = sqliteTable('areas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  longitude: real('longitude').notNull(),
  latitude: real('latitude').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const googlePlaces = sqliteTable('google_places', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  types: text('types', { mode: 'json' }).notNull(),
  primaryType: text('primary_type').notNull(),
  rating: real('rating').notNull(),
  userRatingCount: real('user_rating_count').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  displayName: text('display_name').notNull(),
  raw: text('raw', { mode: 'json' }).notNull().$type<Place>(),
})

export const googlePlacesAreas = sqliteTable(
  'google_places_areas',
  {
    googlePlaceId: text('google_place_id')
      .notNull()
      .references(() => googlePlaces.id),
    areaId: text('area_id')
      .notNull()
      .references(() => areas.id),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => ({
    unique: unique().on(t.googlePlaceId, t.areaId),
  }),
)

#!/usr/bin/env tsx
import { db } from '../../../packages/db/src/index.js'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    area: { type: 'string', short: 'a' },
    city: { type: 'string', short: 'c', default: 'tokyo' },
    language: { type: 'string', short: 'l', default: 'ja' },
    limit: { type: 'string', default: '15' },
  },
  strict: true,
})

if (!values.area) {
  console.error('Error: --area is required')
  process.exit(1)
}

const areaId = values.area
const cityId = values.city
const language = values.language
const limit = Number.parseInt(values.limit || '15', 10)

async function main() {
  // Get top-rated places for the area with localized data and reviews
  const places = await db
    .selectFrom('localizedPlaces as lp')
    .innerJoin('places as p', 'p.id', 'lp.placeId')
    .select([
      'lp.placeId as id',
      'lp.displayName',
      'lp.originalDisplayName',
      'p.rating',
      'p.userRatingCount',
      'p.priceLevel',
      'lp.genres',
      'lp.photos',
      'lp.reviews',
    ])
    .where('lp.cityId', '=', cityId)
    .where('lp.areaId', '=', areaId)
    .where('lp.language', '=', language)
    .where('p.rating', '>', 4.0)
    .orderBy('p.rating', 'desc')
    .orderBy('p.userRatingCount', 'desc')
    .limit(limit)
    .execute()

  // Format output as JSON for easy parsing
  console.log(JSON.stringify(places, null, 2))
}

main().catch(console.error)

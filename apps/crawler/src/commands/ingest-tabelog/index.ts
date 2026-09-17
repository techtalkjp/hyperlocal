import { areas } from '@hyperlocal/consts'
import {
  db,
  extractStation,
  googleMapsSearchUrl,
  selfIdFromSourceUri,
} from '@hyperlocal/db'
import { defineCommand } from 'citty'
import consola from 'consola'
import { upsertPlace } from '../retrieve-place-details/mutations'
import { geocodeBlock } from '~/services/gsi'
import { db as duckdb } from '~/services/duckdb.server'

export default defineCommand({
  meta: {
    name: 'ingest-tabelog',
    description:
      'Tabelog直結でstagingに取込 (Google不使用。新規追加＋評価更新。reviews/photos/hours/cidは既存温存)',
  },
  args: {
    limit: {
      type: 'string',
      description: '処理する件数 (省略時は全件)',
      default: undefined,
    },
    url: {
      type: 'string',
      description: '対象URL部分一致 (1店舗試運転用)',
      default: undefined,
    },
  },
  run: async ({ args }) => {
    await ingestTabelog({
      limit: args.limit ? Number.parseInt(args.limit, 10) : undefined,
      url: args.url,
    })
  },
})

// 予算表記 (～￥999 / ￥1,000～￥1,999 / -) -> PRICE_LEVEL_*
const priceLevelOf = (budgets: string[]): string | null => {
  const nums = budgets.flatMap((b) =>
    [...b.matchAll(/￥([0-9,]+)/g)].map((m) => Number(m[1].replaceAll(',', ''))),
  )
  if (nums.length === 0) return null
  const max = Math.max(...nums)
  if (max < 2000) return 'PRICE_LEVEL_INEXPENSIVE'
  if (max < 5000) return 'PRICE_LEVEL_MODERATE'
  if (max < 10000) return 'PRICE_LEVEL_EXPENSIVE'
  return 'PRICE_LEVEL_VERY_EXPENSIVE'
}

// ParseJSONResultsPlugin済みのobject/arrayをTEXT列に戻す
const asText = (v: unknown): string | null => {
  if (v === null || v === undefined) return null
  return typeof v === 'string' ? v : JSON.stringify(v)
}

interface IngestTabelogOptions {
  limit?: number
  url?: string
}
export const ingestTabelog = async (opts: IngestTabelogOptions) => {
  let restaurants = await duckdb.selectFrom('restaurants').selectAll().execute()
  if (opts.url) restaurants = restaurants.filter((r) => r.url.includes(opts.url as string))
  if (opts.limit) restaurants = restaurants.slice(0, opts.limit)

  const crawled = await duckdb
    .selectFrom('crawled_restaurants')
    .select(['url', 'features'])
    .execute()
  const featuresByUrl = new Map(
    crawled.map((c) => [
      c.url,
      c.features as unknown as Record<string, string>,
    ]),
  )

  let added = 0
  let updated = 0
  for (const r of restaurants) {
    const id = selfIdFromSourceUri(r.url)
    const existing = await db
      .selectFrom('places')
      .selectAll()
      .where('id', '==', id)
      .executeTakeFirst()

    const features = featuresByUrl.get(r.url) ?? {}
    const station = extractStation(features['交通手段'])

    // 評価未取得 (Tabelog無点数) は既存値を温存。0.00表示を作らない。
    // 新規かつ無点数は取込自体を見送り (次回クロールで点数が付けば自動追加)
    const freshRating = typeof r.rating === 'number' ? r.rating : null
    if (!existing && freshRating === null) {
      consola.info(`skip unscored new store: ${r.name}`)
      continue
    }
    const rating = freshRating ?? (existing?.rating as number | undefined) ?? 0
    const userRatingCount =
      freshRating !== null
        ? Math.round(Number(r.reviewCount ?? 0))
        : ((existing?.userRatingCount as number | undefined) ?? 0)

    // 座標: 既存があれば温存、なければGSI (無料)
    let latitude = existing?.latitude ?? 0
    let longitude = existing?.longitude ?? 0
    if (!latitude || !longitude) {
      const geo = await geocodeBlock(r.address)
      if (geo) {
        latitude = geo.lat
        longitude = geo.lng
      }
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    await upsertPlace({
      id,
      googlePlaceId: existing?.googlePlaceId ?? null,
      displayName: r.name,
      // cidリンク温存、なければ店名+駅の検索URLを生成
      googleMapsUri:
        existing?.googleMapsUri ??
        googleMapsSearchUrl(r.name, station ?? undefined),
      sourceUri: r.url,
      latitude,
      longitude,
      rating,
      userRatingCount,
      priceLevel: priceLevelOf([r.budgetDinner, r.budgetLunch]),
      // reviews/photos/hoursは既存温存 (Google-legacy凍結)、新規は空
      regularOpeningHours: existing
        ? asText(existing.regularOpeningHours)
        : null,
      photos: existing ? (asText(existing.photos) ?? '[]') : '[]',
      reviews: existing ? (asText(existing.reviews) ?? '[]') : '[]',
      categories: JSON.stringify(r.categories.split(',')),
      genres: JSON.stringify(r.genres.split(',')),
    })

    if (existing) updated++
    else added++

    // 新規店のリスティング (ranked由来。urlで引く)
    if (!existing) {
      const ranked = await duckdb
        .selectFrom('ranked_restaurants')
        .selectAll()
        .where('url', '==', r.url)
        .execute()
      for (const rk of ranked) {
        const area = areas.find((a) => a.areaId === rk.area)
        if (!area) continue
        await db
          .insertInto('placeListings')
          .values({
            cityId: area.cityId,
            areaId: rk.area,
            categoryId: rk.category,
            rankingType: rk.ranking_type,
            placeId: id,
          })
          .onConflict((oc) => oc.doNothing())
          .execute()
      }
    }
  }
  consola.info(`ingest done: added=${added} updated=${updated}`)
}

import { defineCommand } from 'citty'
import {
  extractStation,
  googleMapsSearchUrl,
  selfIdFromSourceUri,
} from '@hyperlocal/db'
import consola from 'consola'
import { differenceInDays } from 'date-fns'
import { db as duckdb } from '~/services/duckdb.server'
import { googlePlaceDetails } from './google-place-api'
import { getGooglePlacePhotoUri } from './google-place-api/google-place-photo'
import { upsertPlace } from './mutations'
import { getPlace } from './queries'

export default defineCommand({
  meta: {
    name: 'retrieve-place-details',
    description: 'Google Place API で詳細情報を取得',
  },
  args: {
    count: {
      type: 'string',
      description: '処理する件数',
      default: '1',
    },
  },
  run: async ({ args }) => {
    const count = Number.parseInt(args.count, 10)
    if (Number.isNaN(count)) {
      throw new Error('Invalid count')
    }
    await retrievePlaceDetails({
      count: count,
    })
  },
})

interface RetrievePlaceDetailsOptions {
  count: number
}
export const retrievePlaceDetails = async (
  opts: RetrievePlaceDetailsOptions,
) => {
  const restaurants = await duckdb
    .selectFrom('restaurants')
    .selectAll()
    .where('placeId', 'is not', null)
    .execute()

  let n = 0
  for (const restaurant of restaurants) {
    if (!restaurant.placeId) {
      consola.warn('Place ID not found', restaurant)
      continue
    }

    // 既存の場所情報があり、最終更新が3ヶ月未満の場合はスキップ
    const existPlace = await getPlace(restaurant.placeId)
    if (
      existPlace &&
      differenceInDays(new Date(), new Date(existPlace.updatedAt)) < 90
    ) {
      // consola.info(
      //   'Skip',
      //   restaurant.placeId,
      //   format(new Date(existPlace.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
      // )
      continue
    }

    // Google Place API で詳細情報を取得
    const googlePlace = await googlePlaceDetails({
      placeId: restaurant.placeId,
    })
    if (!googlePlace) {
      consola.warn('Place not found', restaurant)
      continue
    }
    if (!googlePlace.reviews) {
      console.warn('Place reviews not found', restaurant)
      continue
    }

    // 画像情報を取得(最大5枚)
    const photos: string[] = []
    if (googlePlace.photos) {
      for (const photo of googlePlace.photos.slice(0, 5)) {
        photos.push(
          await getGooglePlacePhotoUri({
            name: photo.name,
          }),
        )
      }
    }

    consola.info(
      `upsertPlace: ${n + 1}`,
      restaurant.placeId,
      googlePlace.displayName.text,
    )

    // データを保存 (主キーは自社ID。Google IDはgoogle_place_idに退避)
    // MapsリンクはAPI値優先、なければ店名+駅の検索URLを生成 (キー不要)
    const crawled = await duckdb
      .selectFrom('crawled_restaurants')
      .select('features')
      .where('url', '==', restaurant.url)
      .executeTakeFirst()
    const station = extractStation(
      (crawled?.features as Record<string, string> | undefined)?.['交通手段'],
    )
    await upsertPlace({
      id: selfIdFromSourceUri(restaurant.url),
      googlePlaceId: restaurant.placeId,
      googleMapsUri:
        googlePlace.googleMapsUri ??
        googleMapsSearchUrl(googlePlace.displayName.text, station),
      displayName: googlePlace.displayName.text,
      sourceUri: restaurant.url,
      latitude: googlePlace.location.latitude,
      longitude: googlePlace.location.longitude,
      // 評価はTabelog由来に一本化 (Google値は使わない)
      rating: restaurant.rating ?? 0,
      userRatingCount: restaurant.reviewCount ?? 0,
      priceLevel: googlePlace.priceLevel,
      regularOpeningHours: JSON.stringify(googlePlace.regularOpeningHours),
      photos: JSON.stringify(photos),
      reviews: JSON.stringify(googlePlace.reviews) ?? '[]',
      categories: JSON.stringify(restaurant.categories.split(',')),
      genres: JSON.stringify(restaurant.genres.split(',')),
    })

    n++
    if (n >= opts.count) {
      break
    }

    if (n % 100 === 0) {
      consola.info('Processing', n)
    }
  }
}

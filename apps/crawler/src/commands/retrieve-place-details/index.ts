import { defineCommand } from 'citty'
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

    // データを保存
    await upsertPlace({
      id: restaurant.placeId,
      displayName: googlePlace.displayName.text,
      googleMapsUri: googlePlace.googleMapsUri,
      sourceUri: restaurant.url,
      latitude: googlePlace.location.latitude,
      longitude: googlePlace.location.longitude,
      rating: googlePlace.rating ?? 0,
      userRatingCount: googlePlace.userRatingCount ?? 0,
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

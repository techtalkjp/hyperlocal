import { cities, languages } from '@hyperlocal/consts'
import { db, type GooglePlace } from '@hyperlocal/db'
import { getPlacePhotoUri } from '@hyperlocal/types'
import { logger, task } from '@trigger.dev/sdk/v3'
import dayjs from '~/libs/dayjs'
import { translatePlaceToLangTask } from './translate-google-place-to-lang'

export const translatePlaceTask = task({
  id: 'translate-google-place',
  run: async (payload: { googlePlaceId: string }) => {
    const place = (await db
      .selectFrom('googlePlaces')
      .selectAll()
      .where('id', '==', payload.googlePlaceId)
      .executeTakeFirstOrThrow()) as unknown as GooglePlace
    logger.info('place', place)

    // TODO: 前回更新から日が浅い場合はスキップ

    const placeArea = await db
      .selectFrom('googlePlacesAreas')
      .selectAll()
      .where('googlePlacesAreas.googlePlaceId', '==', payload.googlePlaceId)
      .executeTakeFirstOrThrow()

    const city = cities.find((city) => city.cityId === placeArea.cityId)
    if (!city) {
      throw new Error(`Unknown City Id: ${placeArea.cityId}`)
    }

    // transform photos
    logger.info('transform photos by google places api')
    const photos: string[] = []
    for (const photo of place.photos) {
      photos.push(
        await getPlacePhotoUri({
          name: photo.name,
        }),
      )
    }
    logger.info('photos', { photos })

    // 翻訳
    await translatePlaceToLangTask.batchTriggerAndWait(
      languages.map((lang) => ({
        payload: {
          googlePlaceId: payload.googlePlaceId,
          from: city.language,
          to: lang.id,
          photos,
        },
      })),
    )

    // 更新を記録
    await db
      .updateTable('googlePlaces')
      .set({
        updatedAt: dayjs().utc().format('YYYY-MM-DD HH:mm:ss'),
      })
      .execute()
  },
})

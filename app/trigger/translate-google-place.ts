import { logger, task } from '@trigger.dev/sdk/v3'
import cities from '~/assets/cities.json'
import languages from '~/assets/languages.json'
import { upsertLocalizedPlace } from '~/features/localize/mutations.server'
import { translateGooglePlace } from '~/features/localize/translate-google-place'
import dayjs from '~/libs/dayjs'
import { db, type GooglePlace } from '~/services/db'
import { getPlacePhotoUri } from '~/services/google-places'

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

    const placeAreas = await db
      .selectFrom('googlePlacesAreas')
      .selectAll()
      .where('googlePlacesAreas.googlePlaceId', '==', payload.googlePlaceId)
      .execute()

    const city = cities.find((city) => city.cityId === placeAreas[0]?.cityId)
    if (!city) {
      throw new Error(`Unknown City Id: ${placeAreas[0]?.cityId}`)
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
    for (const lang of languages) {
      logger.info(`translate ${place.id} from ${city.language} to ${lang.id}`)
      const translated = await translateGooglePlace(
        place,
        city.language,
        lang.id,
      )
      logger.info('translated', translated)

      // localized place 保存
      for (const areaCategory of placeAreas) {
        const values = {
          cityId: city.cityId,
          areaId: areaCategory.areaId,
          categoryId: areaCategory.categoryId,
          languageId: lang.id,
          googlePlace: place,
          photos,
          translated,
        }
        await upsertLocalizedPlace(values)
        logger.info('upsertLocalizedPlace', values)
      }
    }

    // 更新を記録
    await db
      .updateTable('googlePlaces')
      .set({
        updatedAt: dayjs().utc().format('YYYY-MM-DD HH:mm:ss'),
      })
      .execute()
  },
})

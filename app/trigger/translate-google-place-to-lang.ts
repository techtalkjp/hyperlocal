import { logger, task } from '@trigger.dev/sdk/v3'
import { upsertLocalizedPlace } from '~/features/localize/mutations.server'
import { translateGooglePlace } from '~/features/localize/translate-google-place'
import { db, type GooglePlace } from '~/services/db'

export const translatePlaceToLangTask = task({
  id: 'translate-google-place-to-lang',
  run: async (payload: {
    googlePlaceId: string
    from: string
    to: string
    photos: string[]
  }) => {
    const place = (await db
      .selectFrom('googlePlaces')
      .selectAll()
      .where('id', '==', payload.googlePlaceId)
      .executeTakeFirstOrThrow()) as unknown as GooglePlace
    logger.info('place', place)

    // 翻訳
    logger.info(`translate ${place.id} from ${payload.from} to ${payload.to}`)
    const translated = await translateGooglePlace(
      place,
      payload.from,
      payload.to,
    )
    logger.info('translated', translated)

    const placeAreas = await db
      .selectFrom('googlePlacesAreas')
      .selectAll()
      .where('googlePlacesAreas.googlePlaceId', '==', payload.googlePlaceId)
      .execute()
    logger.info('placeAreas', { placeAreas })

    // localized place 保存
    for (const areaCategory of placeAreas) {
      const values = {
        cityId: areaCategory.cityId,
        areaId: areaCategory.areaId,
        categoryId: areaCategory.categoryId,
        languageId: payload.from,
        googlePlace: place,
        photos: payload.photos,
        translated,
      }
      const upserted = await upsertLocalizedPlace(values)
      logger.info('upsertLocalizedPlace', { upserted })
    }
  },
})

import { logger, task } from '@trigger.dev/sdk/v3'
import categories from '~/assets/categories.json'
import { upsertGooglePlace } from '~/features/place/mutations'
import { db } from '~/services/db'
import { nearBySearch, type PlaceTypes } from '~/services/google-places'

export const registerAreaGooglePlacesCategoryTask = task({
  id: 'register-area-google-places-category',
  run: async (
    payload: {
      areaId: string
      radius: number
      categoryId: string
    },
    { ctx },
  ) => {
    const area = await db
      .selectFrom('areas')
      .selectAll()
      .where('id', '==', payload.areaId)
      .executeTakeFirst()
    if (!area) {
      throw new Error(`Area not found: ${payload.areaId}`)
    }
    logger.info('area', { area })

    const category = categories.find((c) => c.id === payload.categoryId)
    if (!category) {
      throw new Error(`Category not found: ${payload.categoryId}`)
    }
    logger.info(`category: ${category.names.en}`, { category })

    const { places } = await nearBySearch({
      latitude: area.latitude,
      longitude: area.longitude,
      radius: payload.radius,
      includedPrimaryTypes: category.googlePlaceTypes as PlaceTypes[],
    })
    logger.info('places', { places })

    for (const place of places) {
      logger.info(`place: ${place.displayName.text}`, { place })
      const ret = await upsertGooglePlace(
        payload.areaId,
        payload.categoryId,
        place,
      )
      logger.info('upsertGooglePlace', { ret })
    }

    return { places }
  },
})

import { areas, categories, cities } from '@hyperlocal/consts'
import { nearBySearch, type GooglePlaceType } from '@hyperlocal/types'
import { logger, task } from '@trigger.dev/sdk/v3'
import { upsertGooglePlace } from '~/features/place/mutations'

export const registerAreaGooglePlacesCategoryTask = task({
  id: 'register-area-google-places-category',
  run: async (
    payload: {
      cityId: string
      areaId: string
      radius: number
      categoryId: string
    },
    { ctx },
  ) => {
    const city = cities.find((c) => c.cityId === payload.cityId)
    if (!city) {
      throw new Error(`City not found: ${payload.cityId}`)
    }

    const area = areas.find((a) => a.areaId === payload.areaId)
    if (!area) {
      throw new Error(`Area not found: ${payload.areaId}`)
    }
    logger.info('area', { area })

    const category = categories.find((c) => c.id === payload.categoryId)
    if (!category) {
      throw new Error(`Category not found: ${payload.categoryId}`)
    }
    logger.info(`category: ${category.i18n.en}`, { category })

    const { places } = await nearBySearch({
      latitude: area.latitude,
      longitude: area.longitude,
      radius: payload.radius,
      includedPrimaryTypes: category.googlePlaceTypes as GooglePlaceType[],
      languageCode: city.language,
    })
    logger.info('places', { places })

    for (const place of places) {
      logger.info(`place: ${place.displayName.text}`, { place })

      if (place.rating === undefined || place.reviews === undefined) {
        logger.info('place rating or reviews undefined', { place })
        continue
      }

      try {
        const ret = await upsertGooglePlace(
          payload.cityId,
          payload.areaId,
          payload.categoryId,
          place,
        )
        logger.info('upsertGooglePlace', { ret })
      } catch (e) {
        logger.error('upsertGooglePlace', { e })
        throw e
      }
    }

    return { places }
  },
})

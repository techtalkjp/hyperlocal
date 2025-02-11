import { areas } from '@hyperlocal/consts/src'
import { db, type Place } from '@hyperlocal/db'
import consola from 'consola'
import { upsertLocalizedPlace } from '~/features/localize/mutations.server'
import { translatePlace } from '~/features/localize/translate-place'
import { db as duckdb } from '~/services/duckdb.server'

export const translatePlaceToLangTask = async ({
  placeId,
  from,
  to,
}: {
  placeId: string
  from: string
  to: string
}) => {
  const place = await db
    .selectFrom('places')
    .selectAll()
    .where('id', '==', placeId)
    .executeTakeFirstOrThrow()

  const ranked = await duckdb
    .selectFrom('ranked_restaurants')
    .selectAll()
    .where('placeId', '==', placeId)
    .execute()

  if (!ranked) {
    consola.error('no area found for place', place)
    return
  }

  // 翻訳
  const translated = await translatePlace(place as unknown as Place, from, to)

  // localized place 保存
  for (const areaCategory of ranked) {
    const area = areas.find((a) => a.areaId === areaCategory.area)
    if (!area) {
      consola.error('no area found for areaId', areaCategory.area)
      continue
    }

    await upsertLocalizedPlace({
      cityId: area.cityId,
      areaId: area.areaId,
      categoryId: areaCategory.category,
      languageId: to,
      rankingType: areaCategory.ranking_type,
      place: place as unknown as Place,
      translated,
    })
  }
}

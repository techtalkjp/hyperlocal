import { db, type Place } from '@hyperlocal/db'
import { upsertLocalizedPlace } from '~/features/localize/mutations.server'
import { translatePlace } from '~/features/localize/translate-place'

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
  console.log('place', place)

  // 翻訳
  console.log(`translate ${place.id} from ${from} to ${to}`)
  const translated = await translatePlace(place as unknown as Place, from, to)
  console.log('translated', translated)

  const placeAreas = await db
    .selectFrom('placeListings')
    .selectAll()
    .where('placeId', '==', placeId)
    .execute()
  console.info('placeAreas', { placeAreas })

  // localized place 保存
  for (const areaCategory of placeAreas) {
    const upserted = await upsertLocalizedPlace({
      cityId: areaCategory.cityId,
      areaId: areaCategory.areaId,
      categoryId: areaCategory.categoryId,
      languageId: to,
      rankingType: areaCategory.rankingType,
      place: place as unknown as Place,
      translated,
    })
    console.info('upsertLocalizedPlace', { upserted })
  }
}

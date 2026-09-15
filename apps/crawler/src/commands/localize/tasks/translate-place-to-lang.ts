import { areas } from '@hyperlocal/consts/src'
import { db, type Place } from '@hyperlocal/db'
import consola from 'consola'
import { upsertLocalizedPlace } from '~/features/localize/mutations.server'
import { sourceHashOf } from '~/features/localize/source-hash'
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

  const sourceHash = sourceHashOf(place as unknown as Place)

  // 全ての掲載キー (city/area/category/ranking) が同ハッシュ済みならスキップ
  const expectedKeys = ranked.flatMap((areaCategory) => {
    const area = areas.find((a) => a.areaId === areaCategory.area)
    if (!area) {
      return []
    }
    return [
      `${area.cityId}/${area.areaId}/${areaCategory.category}/${areaCategory.ranking_type}`,
    ]
  })
  if (expectedKeys.length > 0) {
    const existing = await db
      .selectFrom('localizedPlaces')
      .select(['cityId', 'areaId', 'categoryId', 'rankingType', 'sourceHash'])
      .where('placeId', '==', placeId)
      .where('language', '==', to)
      .execute()
    const doneKeys = new Set(
      existing
        .filter((row) => row.sourceHash === sourceHash)
        .map(
          (row) =>
            `${row.cityId}/${row.areaId}/${row.categoryId}/${row.rankingType}`,
        ),
    )
    if (expectedKeys.every((key) => doneKeys.has(key))) {
      consola.info(`skip (unchanged) ${placeId} -> ${to}`)
      return
    }
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
      sourceHash,
    })
  }
}

import { languages } from '@hyperlocal/consts'
import { db } from '@hyperlocal/db'
import consola from 'consola'
import { db as duckdb } from '~/services/duckdb.server'
import { translatePlaceToLangTask } from './translate-place-to-lang'

export const translatePlaceTask = async ({ placeId }: { placeId: string }) => {
  const place = await db
    .selectFrom('places')
    .select(['id', 'sourceUri'])
    .where('id', '==', placeId)
    .executeTakeFirstOrThrow()

  // ランキングとの突合はTabelog URL (stagingは自社ID)
  const ranked = await duckdb
    .selectFrom('ranked_restaurants')
    .select('url')
    .where('url', '==', place.sourceUri)
    .executeTakeFirst()
  if (!ranked) {
    console.error('no area found for place', place)
    return
  }

  // 各言語に翻訳
  for (const lang of languages) {
    consola.info(`translate ${place.id} to ${lang.id}`)
    await translatePlaceToLangTask({
      placeId: place.id,
      from: 'ja',
      to: lang.id,
    })
  }
}

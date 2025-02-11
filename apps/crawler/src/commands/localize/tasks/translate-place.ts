import { languages } from '@hyperlocal/consts'
import { db } from '@hyperlocal/db'
import consola from 'consola'
import { db as duckdb } from '~/services/duckdb.server'
import { translatePlaceToLangTask } from './translate-place-to-lang'

export const translatePlaceTask = async ({ placeId }: { placeId: string }) => {
  const place = await db
    .selectFrom('places')
    .select('places.id')
    .where('id', '==', placeId)
    .executeTakeFirstOrThrow()

  const ranked = await duckdb
    .selectFrom('ranked_restaurants')
    .select('placeId')
    .where('placeId', '==', placeId)
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

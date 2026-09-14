import type { Place } from '@hyperlocal/db'
import { getDb } from '~/lib/db'
import type { AdminEnv } from '~/lib/request-context'

export const getPlace = async (
  env: AdminEnv,
  placeId: string,
): Promise<Place | undefined> => {
  const place = await getDb(env)
    .selectFrom('places')
    .selectAll()
    .where('places.id', '==', placeId)
    .executeTakeFirst()

  return place as Place | undefined
}

export const getLocalizedPlace = async (
  env: AdminEnv,
  placeId: string,
  lang: string,
) => {
  return await getDb(env)
    .selectFrom('localizedPlaces')
    .distinct()
    .selectAll()
    .where('placeId', '==', placeId)
    .where('language', '==', lang)
    .executeTakeFirst()
}

import type { Place } from '@hyperlocal/db'
import { getDb } from '~/lib/db'
import type { AdminEnv } from '~/lib/request-context'

export const listAreaPlaces = async (
  env: AdminEnv,
  areaId: string,
  categoryId: string,
  rankingType: 'rating' | 'review',
) => {
  const places = (await getDb(env)
    .selectFrom('places')
    .innerJoin('placeListings', 'places.id', 'placeListings.placeId')
    .selectAll('places')
    .where('placeListings.areaId', '=', areaId)
    .where('placeListings.categoryId', '=', categoryId)
    .where('placeListings.rankingType', '=', rankingType)
    .orderBy('places.rating', 'desc')
    .orderBy('places.userRatingCount', 'desc')
    .execute()) as unknown as Array<Place>
  return places
}

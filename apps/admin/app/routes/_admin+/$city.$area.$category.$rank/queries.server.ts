import { db, type Place } from '@hyperlocal/db'

export const listAreaPlaces = async (
  areaId: string,
  categoryId: string,
  rankingType: 'rating' | 'review',
) => {
  const places = (await db
    .selectFrom('places')
    .innerJoin('placeListings', 'places.id', 'placeListings.placeId')
    .selectAll('places')
    .where('placeListings.areaId', '==', areaId)
    .where('placeListings.categoryId', '==', categoryId)
    .where('placeListings.rankingType', '==', rankingType)
    .orderBy('places.rating desc')
    .orderBy('places.userRatingCount desc')
    .execute()) as unknown as Array<Place>
  return places
}

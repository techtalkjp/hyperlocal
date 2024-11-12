import { db, type Place } from '~/services/db.server'

export const listAreaPlaces = async (areaId: string, categoryId: string) => {
  const places = (await db
    .selectFrom('places')
    .innerJoin('placeListings', 'places.id', 'placeListings.placeId')
    .selectAll('places')
    .where('placeListings.areaId', '==', areaId)
    .where('placeListings.categoryId', '==', categoryId)
    .orderBy('places.rating desc')
    .orderBy('places.userRatingCount desc')
    .execute()) as unknown as Array<Place>
  return places
}

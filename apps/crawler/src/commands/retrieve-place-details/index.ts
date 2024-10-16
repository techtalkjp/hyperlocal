import { areas } from '@hyperlocal/consts'
import { differenceInDays, format } from 'date-fns'
import { db as duckdb } from '~/services/duckdb.server'
import { upsertPlace, upsertPlaceListing } from './mutations'
import { placeDetails } from './place-api'
import { getPlace } from './queries'

export const retrievePlaceDetails = async () => {
  const restaurants = await duckdb
    .selectFrom('restaurants')
    .selectAll()
    .where('placeId', 'is not', null)
    .execute()

  let n = 0
  for (const restaurant of restaurants) {
    if (!restaurant.placeId) {
      console.log('Place ID not found', restaurant)
      continue
    }

    const existPlace = await getPlace(restaurant.placeId)
    // １ヶ月未満の場合はスキップ
    if (
      existPlace &&
      differenceInDays(new Date(), new Date(existPlace.updatedAt)) < 30
    ) {
      console.log(
        'Skip',
        restaurant.placeId,
        format(new Date(existPlace.updatedAt), 'yyyy-MM-dd HH:mm:ss'),
      )
      continue
    }

    const place = await placeDetails({ placeId: restaurant.placeId })
    if (!place) {
      console.log('Place not found', restaurant)
      continue
    }
    if (!place.reviews) {
      console.log('Place reviews not found', restaurant)
      continue
    }

    await upsertPlace({
      id: restaurant.placeId,
      displayName: place.displayName.text,
      googleMapsUri: `https://www.google.com/maps/place/?q=place_id:${restaurant.placeId}`,
      sourceUri: restaurant.url,
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      rating: place.rating ?? 0,
      userRatingCount: place.userRatingCount ?? 0,
      priceLevel: place.priceLevel,
      regularOpeningHours: JSON.stringify(place.regularOpeningHours),
      photos: JSON.stringify(place.photos) ?? '[]',
      reviews: JSON.stringify(place.reviews) ?? '[]',
      categories: JSON.stringify(restaurant.categories.split(',')),
      genres: JSON.stringify(restaurant.genres.split(',')),
    })

    const listings = await duckdb
      .selectFrom('ranked_restaurants')
      .selectAll()
      .where('placeId', '==', restaurant.placeId)
      .execute()

    for (const listing of listings) {
      const area = areas.find((area) => area.areaId === listing.area)
      if (!area) {
        console.log('Area not found', restaurant.area)
        continue
      }

      await upsertPlaceListing({
        placeId: restaurant.placeId,
        cityId: area.cityId,
        areaId: area.areaId,
        categoryId: listing.category,
        rankingType: listing.ranking_type,
      })
    }

    n++
    if (n % 100 === 0) {
      console.log('Processing', n)
    }
  }
}

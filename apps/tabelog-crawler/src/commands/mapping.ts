import { db } from '~/services/duckdb.server'
import { textSearch } from '~/services/google-places-ids'

// google places ID をマッピング
export const mapping = async () => {
  const restaurants = await db
    .selectFrom('crawled_restaurants')
    .selectAll()
    .orderBy('reviewCount', 'desc')
    .limit(10)
    .execute()

  for (const restaurant of restaurants) {
    const place = await textSearch({
      textQuery: `${restaurant.address} ${restaurant.name}`,
    })

    const placeId = place.places.map((p) => p.id)[0]

    console.log({
      area: restaurant.area,
      name: restaurant.name,
      address: restaurant.address,
      googlePlacesId: placeId,
      googleMaps: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    })
  }
}

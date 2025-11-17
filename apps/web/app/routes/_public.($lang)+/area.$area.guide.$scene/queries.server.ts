import { db } from '@hyperlocal/db'
import type { GooglePlacePriceLevel } from '@hyperlocal/google-place-api'

export type ParsedAreaArticle = {
  id: string
  cityId: string
  areaId: string
  sceneId: string
  language: string
  title: string
  content: string
  status: string
  metadata: { description: string }
  createdAt: string
  updatedAt: string
}

export type ParsedLocalizedPlace = {
  cityId: string
  areaId: string
  categoryId: string
  rankingType: string
  placeId: string
  language: string
  genres: string[]
  displayName: string
  originalDisplayName: string
  rating: number
  userRatingCount: number
  latitude: number
  longitude: number
  googleMapsUri: string
  sourceUri: string | null
  priceLevel: GooglePlacePriceLevel | null
  regularOpeningHours: unknown
  reviews: Array<{ rating: number; text?: string }>
  photos: string[]
  createdAt: string
  updatedAt: string
}

export const getArticle = async (
  cityId: string,
  areaId: string,
  sceneId: string,
  language: string,
): Promise<ParsedAreaArticle | undefined> => {
  const article = await db
    .selectFrom('areaArticles')
    .selectAll()
    .where('cityId', '=', cityId)
    .where('areaId', '=', areaId)
    .where('sceneId', '=', sceneId)
    .where('language', '=', language)
    .where('status', '=', 'published')
    .executeTakeFirst()

  if (!article) return undefined

  // ParseJSONResultsPlugin already parses JSON fields automatically
  // Just need to cast to the correct types
  return {
    ...article,
    metadata: article.metadata as unknown as { description: string },
  }
}

export const getPlaceById = async (placeId: string) => {
  const place = await db
    .selectFrom('places')
    .selectAll()
    .where('id', '=', placeId)
    .executeTakeFirst()
  return place
}

export const getLocalizedPlaceById = async (
  placeId: string,
  language: string,
): Promise<ParsedLocalizedPlace | null> => {
  // Get the first localized place record for this place ID and language
  const place = await db
    .selectFrom('localizedPlaces')
    .selectAll()
    .where('placeId', '=', placeId)
    .where('language', '=', language)
    .executeTakeFirst()

  if (!place) return null

  // ParseJSONResultsPlugin already parses JSON fields automatically
  // Just need to cast to the correct types
  return {
    ...place,
    genres: place.genres as unknown as string[],
    reviews: place.reviews as unknown as Array<{
      rating: number
      text?: string
    }>,
    photos: place.photos as unknown as string[],
    priceLevel: place.priceLevel as GooglePlacePriceLevel | null,
    regularOpeningHours: place.regularOpeningHours as unknown,
  }
}

export const getOtherArticlesForArea = async (
  cityId: string,
  areaId: string,
  language: string,
  excludeSceneId: string,
) => {
  const articles = await db
    .selectFrom('areaArticles')
    .select(['sceneId', 'title'])
    .where('cityId', '=', cityId)
    .where('areaId', '=', areaId)
    .where('language', '=', language)
    .where('status', '=', 'published')
    .where('sceneId', '!=', excludeSceneId)
    .execute()
  return articles
}

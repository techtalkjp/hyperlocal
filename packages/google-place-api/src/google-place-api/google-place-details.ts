import type { GooglePlace } from './types'

const fieldMask = [
  'id',
  'displayName.text',
  'rating',
  'userRatingCount',
  'location',
  'googleMapsUri',
  'regularOpeningHours',
  'businessStatus',
  'priceLevel',
  'reviews.rating',
  'reviews.originalText.text',
  'photos.name',
]
const defaultLanguageCode = 'ja'

interface PlaceDetailsProps {
  placeId: string
  languageCode?: string
}
/**
 * Search places using Google Maps Places text-search API.
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */

export const googlePlaceDetails = async ({
  placeId,
  languageCode = defaultLanguageCode,
}: PlaceDetailsProps): Promise<GooglePlace | null> => {
  const ret = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?languageCode=${languageCode}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': fieldMask.join(','),
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  )
  const json = (await ret.json()) as unknown as any

  if (json.displayName.text === undefined) {
    return null
  }
}

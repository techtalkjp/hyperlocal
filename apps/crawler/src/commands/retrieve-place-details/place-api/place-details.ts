import type { GooglePlaceType, Place } from './types'

const fieldMask = [
  'id',
  'location',
  'regularOpeningHours',
  'priceLevel',
  'displayName.text',
  'rating',
  'userRatingCount',
  'reviews.rating',
  'reviews.originalText.text',
  'photos.name',
]
const defaultLanguageCode = 'ja'

interface PlaceDetailsProps {
  placeId: string
  includedType?: GooglePlaceType
  languageCode?: string
}
/**
 * Search places using Google Maps Places text-search API.
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */

export const placeDetails = async ({
  placeId,
  languageCode = defaultLanguageCode,
}: PlaceDetailsProps): Promise<Place | null> => {
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
  const json = await ret.json()

  if (json.displayName.text === undefined) {
    return null
  }
  return json
}

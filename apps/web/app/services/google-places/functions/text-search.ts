import { defaultLanguageCode, fieldMask } from '../constants'
import type { GooglePlaceType, Place } from '../types'

interface TextSearchResponse {
  places: Place[]
}
interface TextSearchProps {
  textQuery: string
  includedType?: GooglePlaceType
  latitude: number
  longitude: number
  radius: number
  minRating?: number
  languageCode?: string
}
/**
 * Search places using Google Maps Places text-search API.
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */

export const textSearch = async ({
  textQuery,
  includedType,
  latitude,
  longitude,
  radius,
  minRating,
  languageCode = defaultLanguageCode,
}: TextSearchProps): Promise<TextSearchResponse> => {
  const params = {
    textQuery,
    includedType,
    strictTypeFiltering: true,
    languageCode,
    minRating,
    pageSize: 20,
    locationRestriction: {
      rectangle: calculateBoundingBox(latitude, longitude, radius),
    },
  }

  const ret = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': fieldMask.join(','),
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
      body: JSON.stringify(params),
    },
  )

  const json = await ret.json()
  return json
}

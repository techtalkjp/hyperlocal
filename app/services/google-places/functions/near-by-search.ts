import { defaultLanguageCode, fieldMask } from '../constants'
import type { Place, PlaceType } from '../types'

interface NearbySearchResponse {
  places: Place[]
}

interface NearbySearchProps {
  latitude: number
  longitude: number
  radius: number
  includedPrimaryTypes: PlaceType[]
  rankPreference?: 'POPULARITY' | 'DISTANCE'
  languageCode?: string
}
/**
 * search nearby places using Google Maps Places API.
 * https://developers.google.com/maps/documentation/places/web-service/nearby-search
 */
export const nearBySearch = async ({
  latitude,
  longitude,
  radius,
  includedPrimaryTypes,
  rankPreference = 'POPULARITY',
  languageCode = defaultLanguageCode,
}: NearbySearchProps): Promise<NearbySearchResponse> => {
  const ret = await fetch(
    'https://places.googleapis.com/v1/places:searchNearby',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': fieldMask.join(','),
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
      body: JSON.stringify({
        includedPrimaryTypes,
        languageCode,
        maxResultCount: 20,
        rankPreference,
        locationRestriction: {
          circle: { center: { latitude, longitude }, radius },
        },
      }),
    },
  )

  return await ret.json()
}

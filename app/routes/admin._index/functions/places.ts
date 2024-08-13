import type { PlaceTypes } from '~/services/google-places'

const defaultLanguageCode = 'ja'

interface Place {
  name: string
  id: string
  types: Place[]
  formattedAddress: string
  location: {
    latitude: number
    longitude: number
  }
  rating: number
  googleMapsUri: string
  regularOpeningHours: {
    openNow: boolean
    periods: {
      open: { day: number; hour: number; minute: number }
      close: { day: number; hour: number; minute: number }
    }[]
    weekdayDescriptions: string[]
  }
  businessStatus: string
  priceLevel:
    | 'PRICE_LEVEL_UNSPECIFIED'
    | 'PRICE_LEVEL_FREE'
    | 'PRICE_LEVEL_INEXPENSIVE'
    | 'PRICE_LEVEL_MODERATE'
    | 'PRICE_LEVEL_EXPENSIVE'
  userRatingCount: number
  displayName: {
    text: string
  }
  primaryTypeDisplayName: {
    text: string
  }
  editorialSummary?: {
    text: string
  }
  primaryType: PlaceTypes
  shortFormattedAddress: string
  reviews: {
    rating: number
    originalText: {
      text: string
    }
  }[]
  photos: {
    name: string
  }[]
  goodForChildren: boolean
}

const fieldMask = [
  'places.id',
  'places.name',
  'places.types',
  'places.googleMapsUri',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.location',
  'places.regularOpeningHours',
  'places.businessStatus',
  'places.priceLevel',
  'places.displayName.text',
  'places.primaryType',
  'places.primaryTypeDisplayName.text',
  'places.editorialSummary.text',
  'places.rating',
  'places.userRatingCount',
  'places.reviews.rating',
  'places.reviews.originalText.text',
  'places.photos.name',
  'places.goodForChildren',
]

interface NearbySearchResponse {
  places: Place[]
}

interface NearbySearchProps {
  latitude: number
  longitude: number
  radius: number
  includedPrimaryTypes: [PlaceTypes]
  minRating?: number
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
  minRating,
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
        rankPreference: 'POPULARITY',
        minRating,
        locationRestriction: {
          circle: { center: { latitude, longitude }, radius },
        },
      }),
    },
  )

  return await ret.json()
}

/**
 * 軽度、緯度、半径からそれを囲むボックスを計算する
 * @param latitude
 * @param longitude
 * @param radius
 * @returns
 */
function calculateBoundingBox(
  latitude: number,
  longitude: number,
  radius: number,
) {
  const earthRadius = 6378137 // 地球の半径 (メートル)

  // 緯度1度の長さ（メートル）
  const latLength = 111320

  // 経度1度の長さ（メートル）
  const lonLength = Math.cos((latitude * Math.PI) / 180) * 111320

  // 緯度の変化量
  const deltaLat = radius / latLength

  // 経度の変化量
  const deltaLon = radius / lonLength

  // 四隅の座標を計算
  const high = {
    latitude: latitude + deltaLat,
    longitude: longitude + deltaLon,
  }

  const low = {
    latitude: latitude - deltaLat,
    longitude: longitude - deltaLon,
  }

  return { high, low }
}

interface TextSearchResponse {
  places: Place[]
}
interface TextSearchProps {
  textQuery: string
  includedType?: PlaceTypes
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
  console.log(JSON.stringify(json, null, 2))
  return json
}

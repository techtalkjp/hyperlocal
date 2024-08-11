import type { PlaceTypes } from '~/services/google-places'
/**
 * Crawl nearby places using Google Maps Places API.
 * https://developers.google.com/maps/documentation/places/web-service/nearby-search
 */

interface CrawlResponse {
  places: Place[]
}

interface Place {
  name: string
  id: string
  types: string[]
  location: {
    latitude: number
    longitude: number
  }
  googleMapsUri: string
  businessStatus: string
  displayName: {
    text: string
    languageCode: string
  }
  primaryTypeDisplayName: {
    text: string
    languageCode: string
  }
  primaryType: PlaceTypes
  shortFormattedAddress: string
}

interface CrawlProps {
  latitude: number
  longitude: number
  radius: number
  includedPrimaryTypes: PlaceTypes[]
}
export const crawl = async ({
  latitude,
  longitude,
  radius,
  includedPrimaryTypes,
}: CrawlProps): Promise<CrawlResponse> => {
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
    'places.primaryTypeDisplayName.text',
    'places.editorialSummary.text',
    'places.rating',
    'places.userRatingCount',
    'places.reviews.rating',
    'places.reviews.originalText.text',
    'places.photos.name',
    'places.goodForChildren',
  ]

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
        languageCode: 'ja',
        maxResultCount: 20,
        rankPreference: 'POPULARITY',
        locationRestriction: {
          circle: { center: { latitude, longitude }, radius },
        },
      }),
    },
  )

  return await ret.json()
}

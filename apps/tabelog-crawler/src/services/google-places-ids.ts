interface TextSearchResponse {
  places: { id: string }[]
}

interface TextSearchProps {
  textQuery: string
  pageSize?: number
}
/**
 * Search places using Google Maps Places text-search API.
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */
export const textSearch = async ({
  textQuery,
  pageSize = 3,
}: TextSearchProps): Promise<TextSearchResponse> => {
  const params = {
    textQuery,
    pageSize,
  }

  const ret = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.id',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
      body: JSON.stringify(params),
    },
  )

  const json = await ret.json()
  return json
}

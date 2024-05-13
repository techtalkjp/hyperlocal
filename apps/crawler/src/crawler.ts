export type {}

const main = async () => {
  const fieldMask = [
    'places.id',
    'places.businessStatus',
    'places.types',
    'places.primaryType',
    'places.primaryTypeDisplayName',
    'places.displayName',
    'places.shortFormattedAddress',
    'places.location',
    'places.googleMapsUri',
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
        includedPrimaryTypes: ['convenience_store'],
        languageCode: 'ja',
        maxResultCount: 20,
        rankPreference: 'distance',
        locationRestriction: {
          circle: {
            center: { latitude: 35.6694638, longitude: 139.7644921 },
            radius: 500.0,
          },
        },
      }),
    },
  )
  console.log(ret.status)
  console.log(JSON.stringify(await ret.json()))
}

await main()

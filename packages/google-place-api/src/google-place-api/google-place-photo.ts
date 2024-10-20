export const googlePlacePhoto = async ({
  name,
  maxWidthPx = 400,
  maxHeightPx = 400,
}: {
  name: string
  maxWidthPx?: number
  maxHeightPx?: number
}) => {
  const ret = await fetch(
    `https://places.googleapis.com/v1/${name}/media?key=${process.env.GOOGLE_MAPS_API_KEY}&maxWidthPx=${maxWidthPx}&maxHeightPx=${maxHeightPx}`,
  )
  return ret
}

export const getGooglePlacePhotoUri = async ({
  name,
  maxWidthPx = 400,
  maxHeightPx = 400,
}: {
  name: string
  maxWidthPx?: number
  maxHeightPx?: number
}) => {
  const ret = await fetch(
    `https://places.googleapis.com/v1/${name}/media?key=${process.env.GOOGLE_MAPS_API_KEY}&maxWidthPx=${maxWidthPx}&maxHeightPx=${maxHeightPx}&skipHttpRedirect=true`,
  )
  const photos = (await ret.json()) as unknown as {
    name: string
    photoUri: string
  }
  return photos.photoUri
}

import { upsertGooglePlace } from '~/features/place/mutations'
export const addGooglePlace = async (
  cityId: string,
  areaId: string,
  categoryId: string,
  placeStr: string,
) => {
  const place = JSON.parse(placeStr)
  return await upsertGooglePlace(cityId, areaId, categoryId, place)
}

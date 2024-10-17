import { cities, languages } from '@hyperlocal/consts'
import { db, type GooglePlace } from '@hyperlocal/db'
import { getPlacePhotoUri } from '@hyperlocal/types'
import { translatePlaceToLangTask } from './translate-place-to-lang'

export const translatePlaceTask = async ({ placeId }: { placeId: string }) => {
  const place = (await db
    .selectFrom('places')
    .selectAll()
    .where('id', '==', placeId)
    .executeTakeFirstOrThrow()) as unknown as GooglePlace
  console.info('place', place)

  // TODO: 前回更新から日が浅い場合はスキップ

  const placeArea = await db
    .selectFrom('placeListings')
    .selectAll()
    .where('placeId', '==', placeId)
    .executeTakeFirstOrThrow()

  const city = cities.find((city) => city.cityId === placeArea.cityId)
  if (!city) {
    throw new Error(`Unknown City Id: ${placeArea.cityId}`)
  }

  // transform photos
  console.info('transform photos by google places api')
  const photos: string[] = []
  for (const photo of place.photos) {
    photos.push(
      await getPlacePhotoUri({
        name: photo.name,
      }),
    )
  }
  console.info('photos', { photos })

  // 各言語に翻訳
  for (const lang of languages) {
    console.log(`translate ${place.id} from ${city.language} to ${lang.id}`)
    await translatePlaceToLangTask({
      placeId: place.id,
      from: city.language,
      to: lang.id,
      photos,
    })
  }
}

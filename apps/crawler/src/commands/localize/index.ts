import { db } from '@hyperlocal/db'
import { translatePlaceTask } from './tasks'

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}
interface LocalizeOptions {
  count: number
  all: boolean
}
export const localize = async (opts: LocalizeOptions) => {
  const updatedPlaces = await db
    .selectFrom('places')
    .leftJoin('localizedPlaces', 'places.id', 'localizedPlaces.placeId')
    .$if(
      !opts.all,
      (
        eb, // すべてを翻訳しない場合は、updatedAtがnullまたはplaces.updatedAtよりも新しいものを翻訳する
      ) =>
        eb.where((eb) =>
          eb.or([
            eb('localizedPlaces.updatedAt', 'is', null),
            eb('places.updatedAt', '>', eb.ref('localizedPlaces.updatedAt')),
          ]),
        ),
    )
    .$if(!opts.all, (eb) => eb.limit(opts.count)) // すべてを翻訳しない場合は、指定された数だけ翻訳する
    .select('id')
    .execute()

  let n = 0
  for (const chunk of chunkArray(updatedPlaces, 25)) {
    await Promise.all(
      chunk.map((place) =>
        translatePlaceTask({
          placeId: place.id,
        }),
      ),
    )
    n += chunk.length
    if (n % 100 === 0) {
      console.log(`translated ${n} places`)
    }
  }
  console.log(`translated ${n} places`)

  return
}

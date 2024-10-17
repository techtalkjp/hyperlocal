import { db } from '@hyperlocal/db'
import { translatePlaceTask } from './translate-place'

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

export const translateAreaTask = async (areaId: string) => {
  const placeListings = await db
    .selectFrom('placeListings')
    .select('placeId')
    .where('areaId', '==', areaId)
    .execute()

  for (const chunk of chunkArray(placeListings, 25)) {
    await Promise.all(
      chunk.map((placeListing) =>
        translatePlaceTask({
          placeId: placeListing.placeId,
        }),
      ),
    )
  }
}

import { db } from '@hyperlocal/db'
import { task } from '@trigger.dev/sdk/v3'
import { translatePlaceTask } from './translate-google-place'

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

export const translateAreaTask = task({
  id: 'translate-area',
  run: async (payload: { areaId: string }) => {
    const placeIds = await db
      .selectFrom('googlePlacesAreas')
      .select('googlePlaceId')
      .where('areaId', '==', payload.areaId)
      .execute()

    for (const chunk of chunkArray(placeIds, 25)) {
      await translatePlaceTask.batchTrigger(
        chunk.map((placeId) => ({
          payload: { googlePlaceId: placeId.googlePlaceId },
        })),
      )
    }
  },
})

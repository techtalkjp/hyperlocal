import { db } from '@hyperlocal/db'
import { defineCommand } from 'citty'
import consola from 'consola'
import { translatePlaceTask } from './tasks'

export default defineCommand({
  meta: {
    name: 'localize',
    description: '翻訳してローカライズする',
  },
  args: {
    count: {
      type: 'string',
      description: '処理する件数',
      default: '1',
    },
    all: {
      type: 'boolean',
      description: '全ての場所を翻訳する',
    },
    refresh: {
      type: 'boolean',
      description: '更新された場所のみ翻訳する',
    },
    placeId: {
      type: 'string',
      description: '指定した場所のみ翻訳する',
      default: undefined,
    },
  },
  run: async ({ args }) => {
    const count = Number.parseInt(args.count, 10)
    if (Number.isNaN(count)) {
      throw new Error('Invalid count')
    }
    await localize({
      count: count,
      all: args.all,
      refresh: args.refresh,
      placeId: args.placeId,
    })
  },
})

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
  refresh: boolean
  placeId?: string
}
export const localize = async (opts: LocalizeOptions) => {
  const updatedPlaces = await db
    .selectFrom('places')
    .leftJoin('localizedPlaces', 'places.id', 'localizedPlaces.placeId')
    .$if(
      !opts.refresh,
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
    .$if(opts.placeId !== undefined, (eb) =>
      eb.where('places.id', '==', opts.placeId ?? ''),
    )
    .select('id')
    .distinct()
    .execute()

  consola.info(`translating ${updatedPlaces.length} places`)

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
      consola.info(`translated ${n} places`)
    }
  }
  consola.info(`translated ${n} places`)

  return
}

import { UTCDate } from '@date-fns/utc'
import { db, type DB } from '@hyperlocal/db'
import { format } from 'date-fns'
import type { Insertable } from 'kysely'

export const upsertPlace = async (place: Insertable<DB['places']>) => {
  return await db.transaction().execute(async (tsx) => {
    const placeRecord = {
      ...place,
      updatedAt: format(new UTCDate(), 'yyyy-MM-dd HH:mm:ss'),
    }
    const inserted = await tsx
      .insertInto('places')
      .values(placeRecord)
      .onConflict((oc) => oc.column('id').doUpdateSet(placeRecord))
      .returningAll()
      .executeTakeFirstOrThrow()

    // if (!place.categories) {
    //   return inserted
    // }
    // for (const categoryId of categories) {
    //   await tsx
    //     .insertInto('placeListings')
    //     .values({
    //       placeId: inserted.id,
    //       cityId,
    //       areaId,
    //       categoryId,
    //       rankingType,
    //       updatedAt: format(new UTCDate(), 'yyyy-MM-dd HH:mm:ss'),
    //     })
    //     .onConflict((oc) =>
    //       oc.columns(['placeId', 'areaId', 'categoryId']).doNothing(),
    //     )
    //     .execute()
    // }

    return inserted
  })
}

export const upsertPlaceListing = async ({
  placeId,
  cityId,
  areaId,
  categoryId,
  rankingType,
}: {
  placeId: DB['placeListings']['placeId']
  cityId: DB['placeListings']['cityId']
  areaId: DB['placeListings']['areaId']
  categoryId: DB['placeListings']['categoryId']
  rankingType: DB['placeListings']['rankingType']
}) => {
  return await db
    .insertInto('placeListings')
    .values({
      placeId,
      cityId,
      areaId,
      categoryId,
      rankingType,
      updatedAt: format(new UTCDate(), 'yyyy-MM-dd HH:mm:ss'),
    })
    .onConflict((oc) =>
      oc
        .columns(['cityId', 'areaId', 'categoryId', 'rankingType', 'placeId'])
        .doNothing(),
    )
    .execute()
}

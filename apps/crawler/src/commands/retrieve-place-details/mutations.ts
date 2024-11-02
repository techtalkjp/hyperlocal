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

    return inserted
  })
}

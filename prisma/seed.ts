import areas from '~/assets/areas.json'
import { db } from '~/services/db'

const seed = async () => {
  for (const area of areas) {
    await db.insertInto('areas').values(area).execute()
  }
}

await seed()

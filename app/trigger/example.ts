import { logger, task } from '@trigger.dev/sdk/v3'
import { db } from '~/services/db'

export const helloWorldTask = task({
  id: 'hello-world',
  run: async (payload: { name: string }, { ctx }) => {
    const areas = await db.selectFrom('areas').selectAll().execute()
    logger.log('areas', { areas })

    return { areas }
  },
})

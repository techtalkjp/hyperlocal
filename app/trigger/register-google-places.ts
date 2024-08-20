import { task } from '@trigger.dev/sdk/v3'
import { setTimeout } from 'node:timers/promises'

export const registerGooglePlacesTask = task({
  id: 'register-google-places',
  run: async (
    payload: {
      areaId: string
      categoryId: string
    },
    { ctx },
  ) => {
    await setTimeout(0)
    return { payload }
  },
})

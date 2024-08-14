import type { Params } from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'
import areas from '~/assets/areas.json'

export const getArea = (params: Params) => {
  const { areaId } = zx.parseParams(
    params,
    z.object({
      areaId: z.string(),
    }),
  )
  const area = areas.find((area) => area.id === areaId)
  if (!area) {
    throw new Response('Not Found', { status: 404 })
  }
  return area
}

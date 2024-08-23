import type { Params } from '@remix-run/react'
import areas from '~/assets/areas.json'
import cities from '~/assets/cities.json'

export const getCityArea = (request: Request, params: Params) => {
  const cityId = 'tokyo'
  const city = cities.find((city) => city.cityId === cityId)
  if (!city) {
    throw new Response('Not Found', { status: 404 })
  }
  const { area: areaId } = params
  const area = areas.find((area) => area.areaId === areaId)
  return { city, area }
}

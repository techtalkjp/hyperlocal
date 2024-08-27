import type { Params } from '@remix-run/react'
import areas from '~/assets/areas.json'
import categories from '~/assets/categories.json'
import cities from '~/assets/cities.json'

export const getCityAreaCategory = (params: Params) => {
  const { city: cityId, area: areaId, category: categoryId } = params

  const area = areas.find((area) => area.areaId === areaId)

  const city = cities.find((city) => city.cityId === area?.cityId) || cities[0]
  if (!city) {
    throw new Response('Not Found', { status: 404 })
  }
  const category = categories.find((category) => category.id === categoryId)

  return { city, area, category }
}

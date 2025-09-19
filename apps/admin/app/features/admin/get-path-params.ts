import { areas, categories, cities, languages } from '@hyperlocal/consts'
import type { Params } from 'react-router'

export const getPathParams = (params: Params) => {
  const {
    lang: langId,
    area: areaId,
    category: categoryId,
    rank: rankType,
    place,
  } = params

  const lang = languages.find((lang) => lang.id === langId)
  const area = areas.find((area) => area.areaId === areaId)

  const city = cities.find((city) => city.cityId === area?.cityId) || cities[0]
  if (!city) {
    throw new Response('Not Found', { status: 404 })
  }
  const category = categories.find((category) => category.id === categoryId)

  return { lang, city, area, category, rankType, place }
}

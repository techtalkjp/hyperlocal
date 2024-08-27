import type { Params } from '@remix-run/react'
import areas from '~/consts/areas'
import categories from '~/consts/categories'
import cities from '~/consts/cities'
import languages from '~/consts/languages'

export const getCityAreaCategory = (params: Params) => {
  const {
    lang: langId,
    city: cityId,
    area: areaId,
    category: categoryId,
  } = params

  const lang = languages.find((lang) => lang.id === langId)
  const area = areas.find((area) => area.areaId === areaId)

  const city = cities.find((city) => city.cityId === area?.cityId) || cities[0]
  if (!city) {
    throw new Response('Not Found', { status: 404 })
  }
  const category = categories.find((category) => category.id === categoryId)

  return { lang, city, area, category }
}

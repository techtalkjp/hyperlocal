import type { Params } from '@remix-run/react'
import areas from '~/assets/areas.json'
import categories from '~/assets/categories.json'
import cities from '~/assets/cities.json'
import languages from '~/assets/languages.json'

export const getLangCityAreaCategory = (request: Request, params: Params) => {
  const {
    city: cityId,
    area: areaId,
    category: categoryId,
    lang: langId,
  } = params
  const city = cities.find((city) => city.cityId === cityId) ?? cities[0]
  const area = areas.find((area) => area.areaId === areaId)
  const category = categories.find((category) => category.id === categoryId)
  const lang = languages.find((lang) => lang.id === langId) ?? languages[0]

  return { city, area, category, lang }
}

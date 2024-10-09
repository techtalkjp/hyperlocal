import { areas, categories, cities, languages } from '@hyper-local/consts'
import type { Params } from '@remix-run/react'

export const getLangCityAreaCategory = (request: Request, params: Params) => {
  const {
    city: cityId,
    area: areaId,
    category: categoryId,
    lang: langId,
  } = params

  // リクエストURLのドメイン名から、都市を判定する
  // 例: https://tokyo.example.com -> cityId = 'tokyo'
  // 例: https://seoul.example.com -> cityId = 'seoul'
  const url = new URL(request.url)
  const host = url.host.split('.')[0]
  const city = cities.find((city) => city.cityId === host) ?? cities[0]

  const area = areas.find((area) => area.areaId === areaId)
  const category = categories.find((category) => category.id === categoryId)
  const lang = languages.find((lang) => lang.id === langId) ?? languages[0]

  return { city, area, category, lang }
}

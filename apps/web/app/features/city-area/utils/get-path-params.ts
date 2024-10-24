import { areas, categories, cities, languages } from '@hyperlocal/consts'
import type { Params } from '@remix-run/react'
import { match } from 'ts-pattern'

/**
 * Extracts and returns path parameters from the given request and params.
 *
 * @param {Request} request - The HTTP request object containing the URL.
 * @param {Params} params - An object containing the path parameters.
 * @returns {Object} An object containing the extracted city, area, category, language, and ranking type.
 *
 * @property {City} city - The city object determined from the request URL's domain name.
 * @property {Area} area - The area object found using the areaId from params.
 * @property {Category} category - The category object found using the categoryId from params.
 * @property {Language} lang - The language object found using the langId from params, defaults to the first language if not found.
 * @property {'review' | 'rating'} rankingType - The ranking type determined from the rankingTypeId in params, defaults to 'rating' if not matched.
 *
 * @example
 * const request = new Request('https://tokyo.example.com/areas/shinjuku/dinner/rank/review')
 * const params = { area: 'shinjuku', category: 'food', lang: 'ja', rank: 'review' }
 * const { area, category, city, lang, rankingType } = getPathParams(request, params)
 *
 */
export const getPathParams = (request: Request, params: Params) => {
  const {
    area: areaId,
    category: categoryId,
    lang: langId,
    rank: rankingTypeId,
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
  const rankingType = match(rankingTypeId)
    .returnType<'review' | 'rating' | undefined>()
    .with('review', () => 'review')
    .with('rating', () => 'rating')
    .otherwise(() => undefined)

  return { city, area, category, lang, rankingType }
}

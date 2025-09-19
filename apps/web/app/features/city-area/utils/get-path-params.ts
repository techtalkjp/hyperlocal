import { areas, categories, cities, languages } from '@hyperlocal/consts'
import type { Params } from 'react-router'
import { match } from 'ts-pattern'

type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
// 基本の型定義
type City = Mutable<(typeof cities)[number]>
type Area = Mutable<(typeof areas)[number]>
type Category = Mutable<(typeof categories)[number]>
type Language = Mutable<(typeof languages)[number]>
type RankingType = 'review' | 'rating'

// RequireOptionsの型定義
type RequireOptions = {
  lang?: true
  area?: true
  category?: true
  rank?: true
}

type OptionalParams<R extends RequireOptions> = (R extends { area: true }
  ? { area: Area }
  : { area?: Area }) &
  (R extends { category: true }
    ? { category: Category }
    : { category?: Category }) &
  (R extends { rank: true }
    ? { rankingType: RankingType }
    : { rankingType?: RankingType })

// getPathParamsの戻り値の型を定義
type PathParamsResult<R extends RequireOptions = Record<string, never>> = {
  city: City // 常に必須
  lang: Language // 常に必須
} & OptionalParams<R>

/**
 * Extracts and returns path parameters from the given request and params.
 *
 * @param {Request} request - The HTTP request object containing the URL.
 * @param {Params} params - An object containing the path parameters.
 * @param {Object} options - Configuration specifying which parameters are required.
 * @param {boolean} options.require.area - Whether the area parameter is required (default: false).
 * @param {boolean} options.require.category - Whether the category parameter is required (default: false).
 * @param {boolean} options.require.lang - Whether the language parameter is required (default: false).
 * @param {boolean} options.require.rank - Whether the ranking type parameter is required (default: false).
 * @returns {Object} An object containing the extracted city, area, category, language, and ranking type.
 */
export const getPathParams = <R extends RequireOptions>(
  request: Request,
  params: Params,
  options?: {
    require: R
  },
): PathParamsResult<R> => {
  const {
    lang: langId,
    area: areaId,
    category: categoryId,
    rank: rankingTypeId,
  } = params

  // リクエストURLのサブドメインから、都市を判定する
  const url = new URL(request.url)
  const subdomain = url.hostname.split('.')[0]
  const city =
    cities.find((candidate) => candidate.cityId === subdomain) ?? cities[0]

  const lang =
    langId === undefined
      ? languages[0]
      : languages.find((candidate) => candidate.id === langId) || undefined
  if (options?.require.lang && langId === undefined)
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  if (lang === undefined)
    throw new Response(null, { status: 404, statusText: 'Not Found' })

  const area = areas.find((area) => area.areaId === areaId) || undefined
  if (options?.require.area && !area)
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  const resolvedArea = options?.require.area ? (area as Area) : area

  const category =
    categories.find((category) => category.id === categoryId) || undefined
  if (options?.require.category && !category)
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  const resolvedCategory = options?.require.category
    ? (category as Category)
    : category

  const rankingType = match(rankingTypeId)
    .returnType<RankingType | undefined>()
    .with('review', () => 'review')
    .with('rating', () => 'rating')
    .otherwise(() => undefined)
  if (options?.require.rank && !rankingType)
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  const resolvedRankingType = options?.require.rank
    ? (rankingType as RankingType)
    : rankingType

  const result = {
    city,
    lang,
  } as PathParamsResult<R>

  if (resolvedArea !== undefined) {
    result.area = resolvedArea as PathParamsResult<R>['area']
  }
  if (resolvedCategory !== undefined) {
    result.category = resolvedCategory as PathParamsResult<R>['category']
  }
  if (resolvedRankingType !== undefined) {
    result.rankingType =
      resolvedRankingType as PathParamsResult<R>['rankingType']
  }

  return result
}

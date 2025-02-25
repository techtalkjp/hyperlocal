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
  area?: boolean
  category?: boolean
  rank?: boolean
}

// 返り値の型を条件に応じて変更するためのユーティリティ型
type UndefinedOrDefined<
  T,
  Required extends boolean | undefined,
> = Required extends true ? T : T | undefined

// getPathParamsの戻り値の型を定義
type PathParamsResult<R extends RequireOptions = Record<string, never>> = {
  city: City // 常に必須
  lang: Language // 常に必須
  area: UndefinedOrDefined<Area, R['area']>
  category: UndefinedOrDefined<Category, R['category']>
  rankingType: UndefinedOrDefined<RankingType, R['rank']>
}

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

  // リクエストURLのドメイン名から、都市を判定する
  const url = new URL(request.url)
  const host = url.host.split('.')[0]

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const result: any = {
    city: cities.find((city) => city.cityId === host) ?? cities[0],
    lang: languages[0],
  }

  const lang =
    langId === undefined
      ? languages[0]
      : languages.find((lang) => lang.id === langId) || undefined
  if (lang === undefined)
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  result.lang = lang

  const area = areas.find((area) => area.areaId === areaId) || undefined
  if (options?.require.area && !area)
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  result.area = area

  const category =
    categories.find((category) => category.id === categoryId) || undefined
  if (options?.require.category && !category)
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  result.category = category

  const rankingType = match(rankingTypeId)
    .returnType<RankingType | undefined>()
    .with('review', () => 'review')
    .with('rating', () => 'rating')
    .otherwise(() => undefined)
  if (options?.require.rank && !rankingType)
    throw new Response(null, { status: 404, statusText: 'Not Found' })
  result.rankingType = rankingType

  // undefined を削除
  for (const key of [
    'lang',
    'city',
    'area',
    'category',
    'rankingType',
  ] as const) {
    if (result[key] === undefined) {
      delete result[key]
    }
  }

  return result
}

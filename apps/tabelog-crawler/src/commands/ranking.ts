import { kysely } from '~/services/duckdb.server'

interface Restaurant {
  url: string
  area: string
  name: string
  rating: number
  reviewCount: number
  budgetDinner: string
  budgetLunch: string
  closedDay: string
  address: string
  genres: string[]
}

export const ranking = async () => {
  const restaurants = await kysely
    .selectFrom('crawled_restaurants')
    .selectAll()
    .where('reviewCount', '>=', 3)
    .orderBy('reviewCount', 'desc')
    .execute()

  const areaGenreMap: { [area: string]: { [genre: string]: Restaurant[] } } = {}

  // レストランをエリアごとにグループ化し、その中でジャンルごとにグループ化
  for (const restaurant of restaurants) {
    const { features, ...rest } = restaurant
    const genres = features.ジャンル.split('、')

    if (!areaGenreMap[rest.area]) {
      areaGenreMap[rest.area] = {}
    }

    for (const genre of genres) {
      if (!areaGenreMap[rest.area][genre]) {
        areaGenreMap[rest.area][genre] = []
      }
      areaGenreMap[rest.area][genre].push({
        ...rest,
        genres: genres,
      })
    }
  }

  // 各エリアごとにジャンル別ランキングを作成
  for (const area in areaGenreMap) {
    for (const genre in areaGenreMap[area]) {
      console.log(`${area}: ${genre}: ${areaGenreMap[area][genre].length}件`)

      areaGenreMap[area][genre].sort((a, b) => b.reviewCount - a.reviewCount)
      areaGenreMap[area][genre].forEach((restaurant, index) => {
        console.log({
          rank: index + 1,
          area: restaurant.area,
          name: restaurant.name,
          genre: restaurant.genres,
          rating: restaurant.rating,
          reviewCount: restaurant.reviewCount,
          url: restaurant.url,
        })
      })
    }
  }
}

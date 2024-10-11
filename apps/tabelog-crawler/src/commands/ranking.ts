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
  categories: string[]
  genres: string[]
}

export const ranking = async () => {
  const restaurants = await kysely
    .selectFrom('crawled_restaurants')
    .selectAll()
    .where('reviewCount', '>=', 3)
    .orderBy('reviewCount', 'desc')
    .execute()

  const areaCategoryMap: {
    [area: string]: { [category: string]: Restaurant[] }
  } = {}

  // レストランをエリアごとにグループ化し、その中でジャンルごとにグループ化
  for (const restaurant of restaurants) {
    const { area } = restaurant
    const categories = restaurant.categories

    if (!areaCategoryMap[area]) {
      areaCategoryMap[area] = {}
    }

    for (const category of categories) {
      if (!areaCategoryMap[area][category]) {
        areaCategoryMap[area][category] = []
      }
      areaCategoryMap[area][category].push({
        ...restaurant,
      })
    }
  }

  // 各エリアごとにジャンル別ランキングを作成
  for (const area in areaCategoryMap) {
    for (const category in areaCategoryMap[area]) {
      if (category !== 'dinner') {
        continue
      }
      // highly rated
      console.log(
        `${area}: ${category}: ${areaCategoryMap[area][category].length}件 highly rated`,
      )
      areaCategoryMap[area][category].sort((a, b) => b.rating - a.rating)
      areaCategoryMap[area][category].forEach((restaurant, index) => {
        if (index >= 10) {
          return
        }
        console.log(
          [
            index + 1,
            restaurant.rating,
            restaurant.reviewCount,
            restaurant.name,
            restaurant.url,
          ].join('\t'),
        )
        // console.log({
        //   area,
        //   category,
        //   rank: index + 1,
        //   name: restaurant.name,
        //   categories: restaurant.categories,
        //   genres: restaurant.genres,
        //   rating: restaurant.rating,
        //   reviewCount: restaurant.reviewCount,
        //   url: restaurant.url,
        // })
      })
      console.log()

      // most popular
      console.log(
        `${area}: ${category}: ${areaCategoryMap[area][category].length}件 most popular`,
      )
      areaCategoryMap[area][category].sort(
        (a, b) => b.reviewCount - a.reviewCount,
      )
      areaCategoryMap[area][category].forEach((restaurant, index) => {
        if (index >= 10) {
          return
        }
        console.log(
          [
            index + 1,
            restaurant.rating,
            restaurant.reviewCount,
            restaurant.name,
            restaurant.url,
          ].join('\t'),
        )

        // console.log({
        //   area,
        //   category,
        //   rank: index + 1,
        //   name: restaurant.name,
        // categories: restaurant.categories,
        // genres: restaurant.genres,
        //   rating: restaurant.rating,
        //   reviewCount: restaurant.reviewCount,
        //   url: restaurant.url,
        // })
      })
      console.log()
    }
  }
}

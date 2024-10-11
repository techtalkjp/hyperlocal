import { Dataset } from 'crawlee'
import type { Restaurant } from '~/types.js'
import {
  genreCategoryMapping,
  genreMapping,
  ignoreGenres,
} from './tabelog-categories.js'
import { type Handler, HandlerLabel } from './types.js'

export const restaurantDetailHandler: Handler = async ({ request, $, log }) => {
  log.debug(HandlerLabel.RESTAURANT_DETAIL, request)

  const restaurant: Restaurant = {
    url: request.loadedUrl,
    area: request.userData.area,
    name: $('h2.display-name span').text().trim(),
    rating: Number($('.rdheader-rating__score-val-dtl').text().trim()),
    reviewCount: Number(
      $('.rdheader-rating__review-target em.num').text().trim(),
    ),
    budgetDinner: $('.rdheader-budget__icon:eq(0) .c-rating-v3__val')
      .text()
      .trim(),
    budgetLunch: $('.rdheader-budget__icon:eq(1) .c-rating-v3__val')
      .text()
      .trim(),
    closedDay: $('#short-comment').text().trim(),
    address: $('.rstinfo-table__address').text().trim(),
    categories: [],
    genres: [],
    features: {},
  }

  // 特徴・関連情報の取得
  const features = $('.rstinfo-table__table th').toArray()
  for (const feature of features) {
    const key = $(feature).text().trim()
    const value = $(feature).next().text().trim()
    restaurant.features[key] = value

    // ジャンルをカテゴリに
    if (key === 'ジャンル') {
      for (const tabelogGenre of value.split('、')) {
        // カテゴリ
        if (!ignoreGenres.includes(tabelogGenre)) {
          const category = genreCategoryMapping[tabelogGenre]
          if (category && !restaurant.categories.includes(category)) {
            // レストラン以外
            restaurant.categories.push(category)
          }
          // レストラン
          if (
            !category &&
            !restaurant.categories.includes('lunch') &&
            restaurant.budgetLunch !== '-'
          ) {
            // ランチ
            restaurant.categories.push('lunch')
          }
          if (
            !category &&
            !restaurant.categories.includes('dinner') &&
            restaurant.budgetDinner !== '-'
          ) {
            // ディナー
            restaurant.categories.push('dinner')
          }
        }

        // ジャンルを変換
        const genre = genreMapping[tabelogGenre]
        if (genre && !restaurant.genres.includes(genre)) {
          restaurant.genres.push(genre)
        }
      }
    }
  }

  // データを保存
  if (restaurant.categories.length > 0) {
    const dataset = await Dataset.open('restaurant')
    await dataset.pushData(restaurant)
  }

  // 口コミページへのリンクがあれば、それをクロール対象に追加
  // const reviewPageLink = $('.rstdtl-top-rvwlst__more-link a').attr('href')
  // if (reviewPageLink) {
  // 	await crawler.addRequests([
  // 		{
  // 			url: new URL(reviewPageLink, request.loadedUrl).href,
  // 			label: HandlerLabel.REVIEW_LIST,
  // 			userData: {
  // 				restaurantUrl: request.loadedUrl,
  // 				...request.userData,
  // 			},
  // 		},
  // 	])
  // }
}

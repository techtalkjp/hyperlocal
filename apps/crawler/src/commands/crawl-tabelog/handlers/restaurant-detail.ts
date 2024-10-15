import { Dataset } from 'crawlee'
import type { CrawledRestaurants } from '~/types.js'
import { type Handler, HandlerLabel } from './types.js'

export const restaurantDetailHandler: Handler = async ({ request, $, log }) => {
  log.debug(HandlerLabel.RESTAURANT_DETAIL, request)

  const restaurant: CrawledRestaurants = {
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
    features: {},
  }

  // 特徴・関連情報の取得
  const features = $('.rstinfo-table__table th').toArray()
  for (const feature of features) {
    const key = $(feature).text().trim()
    const value = $(feature).next().text().trim()
    restaurant.features[key] = value
  }

  // データを保存
  const dataset = await Dataset.open('restaurant')
  await dataset.pushData(restaurant)

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

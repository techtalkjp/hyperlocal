import { Dataset } from 'crawlee'
import type { Review } from '~/types.js'
import { type Handler, HandlerLabel } from './types.js'

// レビュー詳細ページ
export const reviewDtailHandler: Handler = async ({ request, $, log }) => {
  const review: Review = {
    restaurantUrl: request.userData.restaurantUrl,
    area: request.userData.area,
    url: request.loadedUrl,
    title: $('.rvw-item__title').text().trim(),
    content: $('.rvw-item__rvw-comment').text().trim(),
    rating: Number($('.rvw-item__ratings--val').first().text().trim()),
  }

  log.debug(HandlerLabel.REVIEW_DETAIL, review)

  const dataset = await Dataset.open('review')
  dataset.pushData(review)
}

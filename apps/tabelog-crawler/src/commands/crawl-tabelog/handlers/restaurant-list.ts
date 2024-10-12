import { type Handler, HandlerLabel } from './types.js'

// 店舗一覧ページ
export const restaurantListHandler: Handler = async ({
  $,
  request,
  enqueueLinks,
  crawler,
}) => {
  await enqueueLinks({
    selector: 'a.list-rst__rst-name-target',
    label: HandlerLabel.RESTAURANT_DETAIL,
    userData: request.userData,
  })

  const nextPageLink = $('.c-pagination__arrow--next').attr('href')
  if (nextPageLink) {
    await crawler.addRequests([
      {
        url: new URL(nextPageLink, request.loadedUrl).href,
        label: HandlerLabel.RESTAURANT_LIST,
        userData: request.userData,
      },
    ])
  }
}

import { type Handler, HandlerLabel } from './types.js'

export const reviewListHandler: Handler = async ({ request, $, crawler }) => {
  // レビュー一覧からの個別レビューへのリンクを追加
  for (const elem of $('.rvw-item__title-target').toArray().slice(0, 5)) {
    const reviewLink = $(elem).attr('href')
    if (reviewLink) {
      await crawler.addRequests([
        {
          url: new URL(reviewLink, request.loadedUrl).href,
          label: HandlerLabel.REVIEW_DETAIL,
          userData: request.userData,
        },
      ])
    }
  }
}

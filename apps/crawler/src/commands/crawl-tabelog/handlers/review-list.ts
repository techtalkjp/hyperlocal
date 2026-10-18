import { type Handler, HandlerLabel } from "./types.js";
import { safeTabelogUrl } from "../safe-tabelog-url.js";

export const reviewListHandler: Handler = async ({ request, $, crawler }) => {
  // レビュー一覧からの個別レビューへのリンクを追加
  const requests = $(".rvw-item__title-target")
    .toArray()
    .slice(0, 5)
    .flatMap((elem) => {
      const reviewLink = $(elem).attr("href");
      const url = safeTabelogUrl(reviewLink ?? "", request.loadedUrl);
      if (!url) return [];
      return [
        {
          url,
          label: HandlerLabel.REVIEW_DETAIL,
          userData: request.userData,
        },
      ];
    });

  if (requests.length > 0) {
    await crawler.addRequests(requests);
  }
};

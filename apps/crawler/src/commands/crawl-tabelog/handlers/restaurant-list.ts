import { type Handler, HandlerLabel } from "./types.js";
import { safeTabelogUrl } from "../safe-tabelog-url.js";

// 店舗一覧ページ
export const restaurantListHandler: Handler = async ({ $, request, crawler }) => {
  const detailRequests = $("a.list-rst__rst-name-target")
    .toArray()
    .flatMap((element) => {
      const url = safeTabelogUrl($(element).attr("href") ?? "", request.loadedUrl);
      return url
        ? [{ url, label: HandlerLabel.RESTAURANT_DETAIL, userData: request.userData }]
        : [];
    });
  if (detailRequests.length > 0) await crawler.addRequests(detailRequests);

  const nextPageLink = $(".c-pagination__arrow--next").attr("href");
  const nextPageUrl = safeTabelogUrl(nextPageLink ?? "", request.loadedUrl);
  if (nextPageUrl) {
    await crawler.addRequests([
      {
        url: nextPageUrl,
        label: HandlerLabel.RESTAURANT_LIST,
        userData: request.userData,
      },
    ]);
  }
};

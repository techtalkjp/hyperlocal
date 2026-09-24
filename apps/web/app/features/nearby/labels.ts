import type { i18nRecord } from "@hyperlocal/consts";

export const nearbyLabels = {
  title: {
    en: "Open now near you",
    ja: "近くで今開いている店",
    ko: "근처에서 지금 영업 중",
    "zh-cn": "附近正在营业",
    "zh-tw": "附近正在營業",
  },
  locating: {
    en: "Getting your location…",
    ja: "現在地を取得しています…",
    ko: "현재 위치를 가져오는 중…",
    "zh-cn": "正在获取当前位置…",
    "zh-tw": "正在取得目前位置…",
  },
  noLocation: {
    en: "Location unavailable. Pick an area below.",
    ja: "位置情報が使えません。下のエリアから選んでください。",
    ko: "위치 정보를 사용할 수 없습니다. 아래 지역에서 선택하세요.",
    "zh-cn": "无法获取位置，请从下方选择地区。",
    "zh-tw": "無法取得位置，請從下方選擇地區。",
  },
  outOfCoverage: {
    en: "You're outside our covered areas. Pick an area below.",
    ja: "対応エリアの近くにいません。下のエリアから選んでください。",
    ko: "지원 지역 근처가 아닙니다. 아래 지역에서 선택하세요.",
    "zh-cn": "您不在覆盖地区附近，请从下方选择地区。",
    "zh-tw": "您不在覆蓋地區附近，請從下方選擇地區。",
  },
  openOnly: {
    en: "Open now",
    ja: "営業中のみ",
    ko: "영업 중만",
    "zh-cn": "仅显示营业中",
    "zh-tw": "僅顯示營業中",
  },
  empty: {
    en: "Nothing open nearby right now.",
    ja: "近くで今開いている店はありません。",
    ko: "근처에 지금 영업 중인 가게가 없습니다.",
    "zh-cn": "附近现在没有营业中的店。",
    "zh-tw": "附近現在沒有營業中的店。",
  },
  allAreas: {
    en: "All areas",
    ja: "エリア一覧",
    ko: "전체 지역",
    "zh-cn": "所有地区",
    "zh-tw": "所有地區",
  },
} satisfies Record<string, i18nRecord>;

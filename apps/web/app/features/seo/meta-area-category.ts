import { match } from 'ts-pattern'
import areas from '~/consts/areas'
import cities from '~/consts/cities'
import type { LanguageId } from '~/consts/languages'

type CategoryId =
  | 'cafe'
  | 'restaurant'
  | 'shopping'
  | 'nightlife'
  | 'convenience_store'
  | 'drugstore'
  | 'tourist_attractions'
  | 'transit'

interface LocaleStrings {
  instant_guide: string
  best: Record<CategoryId, string>
  quick_list: string
  top_rated_spots: string
  perfect_for: string
  faster_than_map: string
  see_options: string
  real_time_status: string
  ratings: string
  brief_descriptions: string
  helps_find: string
  without_hassle: string
}

const localeStrings: Record<LanguageId, LocaleStrings> = {
  en: {
    instant_guide: 'Instant guide to',
    best: {
      cafe: 'best cafes',
      restaurant: 'top restaurants',
      shopping: 'great shopping spots',
      nightlife: 'exciting nightlife venues',
      convenience_store: 'convenient stores',
      drugstore: 'nearby drugstores',
      tourist_attractions: 'must-visit attractions',
      transit: 'transit options',
    },
    quick_list: 'Quick list of top-rated spots in',
    top_rated_spots: 'top-rated spots',
    perfect_for: 'perfect for on-the-go decisions',
    faster_than_map: 'Faster than map searches',
    see_options: 'see quality options at a glance',
    real_time_status: 'Real-time open/closed status',
    ratings: 'ratings',
    brief_descriptions: 'brief English descriptions',
    helps_find: 'helps tourists and locals find great places in',
    without_hassle: 'without the hassle',
  },
  ja: {
    instant_guide: 'のガイド',
    best: {
      cafe: '厳選カフェ',
      restaurant: '人気レストラン',
      shopping: 'おすすめショッピングスポット',
      nightlife: '魅力的な夜遊びスポット',
      convenience_store: '便利なコンビニ',
      drugstore: '近くのドラッグストア',
      tourist_attractions: '必見の観光スポット',
      transit: '交通アクセス',
    },
    quick_list: '観光中の急な探しに最適',
    top_rated_spots: 'トップレビューの場所',
    perfect_for: 'に最適',
    faster_than_map: '地図検索より素早く',
    see_options: 'を一覧でチェック',
    real_time_status: 'リアルタイムの営業状況',
    ratings: '評価付き',
    brief_descriptions: '簡単な説明',
    helps_find: 'で、',
    without_hassle: 'をサクッと見つけよう',
  },
  'zh-CN': {
    instant_guide: '速览',
    best: {
      cafe: '最佳咖啡馆',
      restaurant: '顶级餐厅',
      shopping: '热门购物地点',
      nightlife: '精彩夜生活场所',
      convenience_store: '便利店',
      drugstore: '附近药店',
      tourist_attractions: '必游景点',
      transit: '交通选择',
    },
    quick_list: '精选场所一览',
    top_rated_spots: '顶级场所',
    perfect_for: '适合旅游中的随性选择',
    faster_than_map: '比地图搜索更快捷',
    see_options: '一眼掌握优质选择',
    real_time_status: '实时营业状态',
    ratings: '评分',
    brief_descriptions: '简要中文介绍',
    helps_find: '助您轻松找到',
    without_hassle: '的完美去处',
  },
  'zh-TW': {
    instant_guide: '速覽',
    best: {
      cafe: '頂級咖啡廳',
      restaurant: '熱門餐廳',
      shopping: '熱門購物地點',
      nightlife: '精彩夜生活場所',
      convenience_store: '便利商店',
      drugstore: '附近藥妝店',
      tourist_attractions: '必訪景點',
      transit: '交通選擇',
    },
    quick_list: '精選場所一覽',
    top_rated_spots: '頂級場所',
    perfect_for: '適合旅遊中的即興決定',
    faster_than_map: '比地圖搜尋更快',
    see_options: '一目了然優質選擇',
    real_time_status: '即時營業狀態',
    ratings: '評分',
    brief_descriptions: '簡要中文介紹',
    helps_find: '助您輕鬆找到',
    without_hassle: '的完美去處',
  },
  ko: {
    instant_guide: '즉석 가이드',
    best: {
      cafe: '최고의 카페',
      restaurant: '인기 레스토랑',
      shopping: '훌륭한 쇼핑 장소',
      nightlife: '흥미진진한 나이트라이프 명소',
      convenience_store: '편의점',
      drugstore: '주변 약국',
      tourist_attractions: '필수 관광 명소',
      transit: '교통 옵션',
    },
    quick_list: '최상위 장소 목록',
    top_rated_spots: '최고 평점의 장소',
    perfect_for: '여행 중 즉흥적인 선택에 안성맞춤',
    faster_than_map: '지도 검색보다 빠르게',
    see_options: '한눈에 확인',
    real_time_status: '실시간 영업 정보',
    ratings: '평점',
    brief_descriptions: '간단한 한국어 설명',
    helps_find: '에서 훌륭한 장소를 손쉽게 찾도록 도와줍니다',
    without_hassle: '번거로움 없이',
  },
} as const

export function generateAreaCategoryMetaDescription(
  cityId: string,
  areaId: string,
  categoryId: CategoryId,
  locale: LanguageId,
): string {
  const l = localeStrings[locale]
  const categoryName = l.best[categoryId]
  const city = cities.find((c) => c.cityId === cityId)
  if (!city) {
    throw new Error('City not found')
  }
  const area = areas.find((a) => a.areaId === areaId)
  if (!area) {
    throw new Error('Area not found')
  }

  const cityName = city.i18n[locale]
  const areaName = area.i18n[locale]

  return match(locale)
    .with(
      'en',
      () =>
        `${l.instant_guide} ${areaName}'s ${categoryName} in ${cityName}. ${l.faster_than_map}. ${l.real_time_status}, ${l.ratings}. Hyperlocal ${cityName} ${l.helps_find} ${areaName}.`,
    )
    .with(
      'ja',
      () =>
        `${cityName}${areaName}の${categoryName}${l.instant_guide}。${l.faster_than_map}、${l.real_time_status}、${l.ratings}。Hyperlocal${cityName}で${areaName}の${categoryName}${l.without_hassle}。`,
    )
    .with(
      'zh-CN',
      'zh-TW',
      () =>
        `${cityName}${areaName}${categoryName}${l.instant_guide}。${l.faster_than_map}，${l.real_time_status}，${l.ratings}。Hyperlocal${cityName}${l.helps_find}${areaName}${l.without_hassle}。`,
    )
    .with(
      'ko',
      () =>
        `${cityName} ${areaName}의 ${categoryName} ${l.instant_guide}. ${l.faster_than_map}, ${l.real_time_status}, ${l.ratings}. Hyperlocal ${cityName}가 ${areaName}의 ${categoryName}${l.helps_find}.`,
    )
    .exhaustive()
}

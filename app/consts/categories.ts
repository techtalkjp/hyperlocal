import type { GooglePlaceType } from '~/services/google-places'
import type { i18nRecord } from './languages'

export interface Category {
  id: string
  googlePlaceTypes: GooglePlaceType[]
  i18n: i18nRecord
}

export default [
  {
    id: 'cafe',
    googlePlaceTypes: ['cafe', 'coffee_shop'],
    i18n: {
      en: 'Cafes',
      ja: 'カフェ',
      'zh-CN': '咖啡店',
      'zh-TW': '咖啡廳',
      ko: '카페',
    },
  },
  {
    id: 'restaurant',
    googlePlaceTypes: ['restaurant'],
    i18n: {
      en: 'Restaurants',
      ja: '飲食店',
      'zh-CN': '餐厅',
      'zh-TW': '餐廳',
      ko: '식당',
    },
  },
  {
    id: 'shopping',
    googlePlaceTypes: [
      'shopping_mall',
      'department_store',
      'clothing_store',
      'discount_store',
      'electronics_store',
      'gift_shop',
      'jewelry_store',
      'liquor_store',
      'market',
      'shoe_store',
    ],
    i18n: {
      en: 'Shop & Style',
      ja: 'ショッピング',
      'zh-CN': '购物天堂',
      'zh-TW': '購物天地',
      ko: '쇼핑 플레이스',
    },
  },
  {
    id: 'nightlife',
    googlePlaceTypes: ['bar', 'night_club'],
    i18n: {
      en: 'Bars & Clubs',
      ja: 'バー・クラブ',
      'zh-CN': '酒吧夜店',
      'zh-TW': '酒吧夜店',
      ko: '바 & 클럽',
    },
  },
  {
    id: 'convenience_store',
    googlePlaceTypes: ['convenience_store'],
    i18n: {
      en: 'C-Store',
      ja: 'コンビニ',
      'zh-CN': '便利店',
      'zh-TW': '便利店',
      ko: '편의점',
    },
  },
  {
    id: 'drugstore',
    googlePlaceTypes: ['drugstore'],
    i18n: {
      en: 'Drugstore',
      ja: 'ドラッグストア',
      'zh-CN': '药店',
      'zh-TW': '藥妝',
      ko: '약국',
    },
  },
  {
    id: 'tourist_attractions',
    googlePlaceTypes: ['tourist_attraction'],
    i18n: {
      en: 'Sights',
      ja: '観光',
      'zh-CN': '景点',
      'zh-TW': '景點',
      ko: '관광',
    },
  },
  {
    id: 'transit',
    googlePlaceTypes: ['subway_station', 'train_station', 'taxi_stand'],
    i18n: {
      en: 'Transit',
      ja: '交通',
      'zh-CN': '交通',
      'zh-TW': '交通',
      ko: '교통',
    },
  },
] as const satisfies Category[]

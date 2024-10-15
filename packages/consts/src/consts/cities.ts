import type { i18nRecord } from './languages'

export interface City {
  cityId: string
  i18n: i18nRecord
  language: string
  latitude: number
  longitude: number
  timezone: string
}

export const cities = [
  {
    cityId: 'tokyo',
    i18n: {
      en: 'Tokyo',
      ja: '東京',
      'zh-CN': '东京',
      'zh-TW': '東京',
      ko: '도쿄',
    },
    language: 'ja',
    latitude: 35.6894,
    longitude: 139.6917,
    timezone: 'Asia/Tokyo',
  },
] as const satisfies City[]

import type { i18nRecord } from './languages'

export interface Area {
  cityId: string
  areaId: string
  name: string
  i18n: i18nRecord
  radius: number
  latitude: number
  longitude: number
}

export default [
  {
    cityId: 'tokyo',
    areaId: 'higashi-ginza',
    name: '東銀座',
    i18n: {
      en: 'East Ginza',
      ja: '東銀座',
      'zh-CN': '东银座',
      'zh-TW': '東銀座',
      ko: '동긴자',
    },
    radius: 400,
    latitude: 35.6694464,
    longitude: 139.7670348,
  },
  {
    cityId: 'tokyo',
    areaId: 'nihonbashi',
    name: '日本橋',
    i18n: {
      en: 'Nihonbashi',
      ja: '日本橋',
      'zh-CN': '日本桥',
      'zh-TW': '日本橋',
      ko: '니혼바시',
    },
    radius: 400,
    latitude: 35.6823317,
    longitude: 139.773856,
  },
  {
    cityId: 'tokyo',
    areaId: 'ningyocho',
    name: '人形町',
    i18n: {
      en: 'Ningyocho',
      ja: '人形町',
      'zh-CN': '人形町',
      'zh-TW': '人形町',
      ko: '닝교초',
    },
    radius: 400,
    latitude: 35.6850407,
    longitude: 139.7834224,
  },
  {
    cityId: 'seoul',
    areaId: 'seonleung',
    name: '선릉',
    i18n: {
      en: 'Seonleung',
      ja: 'ソンルン',
      'zh-CN': '松陵',
      'zh-TW': '松陵',
      ko: '선릉',
    },
    radius: 400,
    latitude: 37.504487,
    longitude: 127.048957,
  },
] as const satisfies Area[]

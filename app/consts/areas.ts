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
      en: 'Higashi-ginza',
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
    areaId: 'apgujeongrodeo',
    name: '압구정로데오',
    i18n: {
      en: 'Apgujeong Rodeo',
      ja: 'アプゲジョンロデオ',
      'zh-CN': '狎鷗亭路',
      'zh-TW': '狎鷗亭路',
      ko: '압구정로데오',
    },
    radius: 400,
    latitude: 37.527631,
    longitude: 127.040631,
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
  {
    cityId: 'seoul',
    areaId: 'seongsu',
    name: '성수',
    i18n: {
      en: 'Seongsu',
      ja: 'ソンス',
      'zh-CN': '聖水',
      'zh-TW': '聖水',
      ko: '성수',
    },
    radius: 400,
    latitude: 37.544444,
    longitude: 127.056111,
  },
  {
    cityId: 'seoul',
    areaId: 'anguk',
    name: '안국',
    i18n: {
      en: 'Anguk',
      ja: 'アングク',
      'zh-CN': '安国',
      'zh-TW': '安國',
      ko: '안국',
    },
    radius: 400,
    latitude: 37.576439,
    longitude: 126.985431,
  },
  {
    cityId: 'seoul',
    areaId: 'sinsa',
    name: '신사',
    i18n: {
      en: 'Sinsa',
      ja: 'シンサ',
      'zh-CN': '新沙',
      'zh-TW': '新沙',
      ko: '신사',
    },
    radius: 400,
    latitude: 37.5162873,
    longitude: 127.0200228,
  },
  {
    cityId: 'seoul',
    areaId: 'garosu-gil',
    name: '가로수길',
    i18n: {
      en: 'Garosu-gil',
      ja: 'カロスキル',
      'zh-CN': '林荫路',
      'zh-TW': '林蔭路',
      ko: '가로수길',
    },
    radius: 400,
    latitude: 37.5208761,
    longitude: 127.0228498,
  },
  {
    cityId: 'seoul',
    areaId: 'incheon-airport',
    name: '인천국제공항',
    i18n: {
      en: 'Incheon Airport',
      ja: '仁川国際空港',
      'zh-CN': '仁川国际机场',
      'zh-TW': '仁川國際機場',
      ko: '인천국제공항',
    },
    radius: 1200,
    latitude: 37.457868,
    longitude: 126.4355671,
  },
] as const satisfies Area[]

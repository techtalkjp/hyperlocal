import type { i18nRecord } from './languages'

export interface Area {
  cityId: string
  areaId: string
  name: string
  i18n: i18nRecord
  radius: number
  latitude: number
  longitude: number
  tabelogUrl: string
}

export const areas = [
  {
    cityId: 'tokyo',
    areaId: 'tokyo-station',
    name: '東京駅',
    i18n: {
      en: 'Tokyo Station',
      ja: '東京駅',
      'zh-CN': '东京站',
      'zh-TW': '東京站',
      ko: '도쿄역',
    },
    radius: 80,
    latitude: 35.680743,
    longitude: 139.7682689,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1302/A130201/R6586/rstLst/1?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'marunouchi',
    name: '丸の内',

    i18n: {
      en: 'Marunouchi',
      ja: '丸の内',
      'zh-CN': '丸之内',
      'zh-TW': '丸之內',
      ko: '마루노우치',
    },
    radius: 80,
    latitude: 35.6816919,
    longitude: 139.7635604,
    tabelogUrl:
      'https://tabelog.com/tokyo/C13101/C36087/rstLst/1?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'ginza',
    name: '銀座',
    i18n: {
      en: 'Ginza',
      ja: '銀座',
      'zh-CN': '银座',
      'zh-TW': '銀座',
      ko: '긴자',
    },
    radius: 160,
    latitude: 35.6712552,
    longitude: 139.7650191,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1301/A130101/R3368/rstLst/1?SrtT=rt&LstRange=SF',
  },
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
    radius: 160,
    latitude: 35.6694464,
    longitude: 139.7670348,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1301/A130101/R8188/rstLst/1?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'tsukiji',
    name: '築地',
    i18n: {
      en: 'Tsukiji',
      ja: '築地',
      'zh-CN': '筑地',
      'zh-TW': '築地',
      ko: '쓰키지',
    },
    radius: 160,
    latitude: 35.6665341,
    longitude: 139.7705992,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1313/A131301/R6341/rstLst/1?SrtT=rt&LstRange=SF',
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
    radius: 160,
    latitude: 35.6823317,
    longitude: 139.773856,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1302/A130202/R7650/rstLst/1?SrtT=rt&LstRange=SF',
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
    tabelogUrl:
      'https://tabelog.com/tokyo/A1302/A130204/R7672/rstLst/1?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'kiyosumi-shirakawa',
    name: '清澄白河',
    i18n: {
      en: 'Kiyosumi-shirakawa',
      ja: '清澄白河',
      'zh-CN': '清澄白河',
      'zh-TW': '清澄白河',
      ko: '키요스미시라카와',
    },
    radius: 160,
    latitude: 35.6799672,
    longitude: 139.8014225,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1313/A131303/R3341/rstLst/1?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'kinshicho',
    name: '錦糸町',
    i18n: {
      en: 'Kinshicho',
      ja: '錦糸町',
      'zh-CN': '锦糸町',
      'zh-TW': '錦糸町',
      ko: '킨시쵸',
    },
    radius: 160,
    latitude: 35.6953134,
    longitude: 139.8140385,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1312/A131201/R3373/rstLst/1?SrtT=rt&LstRange=SF',
  },
] as const satisfies Area[]

import type { i18nRecord } from './languages'

export interface Scene {
  id: string
  i18n: i18nRecord
  description: i18nRecord
}

export const scenes = [
  {
    id: 'morning-cafe',
    i18n: {
      en: 'Morning Cafe',
      ja: '朝カフェ',
      'zh-cn': '早晨咖啡',
      'zh-tw': '早晨咖啡',
      ko: '모닝 카페',
    },
    description: {
      en: 'Perfect cafes for a morning start',
      ja: '朝のスタートにぴったりなカフェ',
      'zh-cn': '适合早晨开始的咖啡馆',
      'zh-tw': '適合早晨開始的咖啡廳',
      ko: '아침을 시작하기 좋은 카페',
    },
  },
  {
    id: 'lunch-spot',
    i18n: {
      en: 'Lunch Spots',
      ja: 'ランチスポット',
      'zh-cn': '午餐地点',
      'zh-tw': '午餐地點',
      ko: '점심 장소',
    },
    description: {
      en: 'Great places for lunch',
      ja: 'ランチにおすすめの場所',
      'zh-cn': '午餐的好去处',
      'zh-tw': '午餐的好去處',
      ko: '점심 식사하기 좋은 곳',
    },
  },
  {
    id: 'afternoon-break',
    i18n: {
      en: 'Afternoon Break',
      ja: '午後の休憩',
      'zh-cn': '下午休息',
      'zh-tw': '下午休息',
      ko: '오후 휴식',
    },
    description: {
      en: 'Relaxing spots for afternoon tea and sweets',
      ja: 'アフタヌーンティーやスイーツで休憩できる場所',
      'zh-cn': '下午茶和甜点的放松场所',
      'zh-tw': '下午茶和甜點的放鬆場所',
      ko: '애프터눈 티와 디저트를 즐길 수 있는 곳',
    },
  },
  {
    id: 'dinner-date',
    i18n: {
      en: 'Dinner & Date',
      ja: 'ディナー・デート',
      'zh-cn': '晚餐约会',
      'zh-tw': '晚餐約會',
      ko: '저녁 데이트',
    },
    description: {
      en: 'Romantic dinner spots perfect for dates',
      ja: 'デートにぴったりなディナースポット',
      'zh-cn': '适合约会的浪漫晚餐地点',
      'zh-tw': '適合約會的浪漫晚餐地點',
      ko: '데이트하기 좋은 로맨틱한 저녁 식사 장소',
    },
  },
  {
    id: 'late-night',
    i18n: {
      en: 'Late Night',
      ja: '深夜営業',
      'zh-cn': '深夜营业',
      'zh-tw': '深夜營業',
      ko: '심야 영업',
    },
    description: {
      en: 'Open late for night owls',
      ja: '夜遅くまで営業している店',
      'zh-cn': '深夜营业的店铺',
      'zh-tw': '深夜營業的店鋪',
      ko: '밤늦게까지 영업하는 곳',
    },
  },
  {
    id: 'solo-dining',
    i18n: {
      en: 'Solo Dining',
      ja: '一人ごはん',
      'zh-cn': '独自用餐',
      'zh-tw': '獨自用餐',
      ko: '혼자 식사',
    },
    description: {
      en: 'Comfortable spots for dining alone',
      ja: '一人でも気軽に入れる店',
      'zh-cn': '适合独自用餐的舒适场所',
      'zh-tw': '適合獨自用餐的舒適場所',
      ko: '혼자 식사하기 편안한 곳',
    },
  },
  {
    id: 'local-favorite',
    i18n: {
      en: 'Local Favorites',
      ja: '地元で人気',
      'zh-cn': '当地人气',
      'zh-tw': '當地人氣',
      ko: '현지인 인기',
    },
    description: {
      en: 'Popular spots loved by locals',
      ja: '地元の人に愛される人気スポット',
      'zh-cn': '当地人喜爱的热门地点',
      'zh-tw': '當地人喜愛的熱門地點',
      ko: '현지인들이 사랑하는 인기 장소',
    },
  },
] as const satisfies Scene[]

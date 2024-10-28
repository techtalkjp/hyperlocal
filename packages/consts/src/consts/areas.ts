import type { i18nRecord } from './languages'

export interface Area {
  cityId: string
  areaId: string
  name: string
  i18n: i18nRecord
  description: i18nRecord
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
    description: {
      en: 'The gateway to Tokyo. A beautiful red-brick building that combines historical architecture with a modern transportation hub.',
      ja: '東京の玄関口。歴史的な赤レンガ駅舎と最新の交通ハブが融合する象徴的な場所。',
      'zh-CN': '东京的门户。红砖建筑与现代交通枢纽融为一体的标志性建筑。',
      'zh-TW': '東京的門戶。紅磚建築與現代交通樞紐融為一體的標誌性建築。',
      ko: '도쿄의 관문. 역사적인 붉은 벽돌 건물과 현대적인 교통 허브가 조화를 이루는 상징적인 장소.',
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
    description: {
      en: "Tokyo's premier business district with modern skyscrapers, upscale shopping, and fine dining.",
      ja: '東京を代表するビジネス街。近代的な高層ビル群、高級ショッピング、上質なレストランが集まる。',
      'zh-CN': '东京的主要商务区，云集现代摩天大楼、高级购物中心和精致餐厅。',
      'zh-TW': '東京的主要商務區，雲集現代摩天大樓、高級購物中心和精緻餐廳。',
      ko: '도쿄를 대표하는 비즈니스 지구. 현대적인 고층 빌딩, 고급 쇼핑, 미식 레스토랑이 모여 있는 곳.',
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
    description: {
      en: "Tokyo's most prestigious shopping and entertainment district, home to luxury brands and traditional department stores.",
      ja: '東京を代表する高級ショッピング街。世界的なラグジュアリーブランドと老舗百貨店が軒を連ねる。',
      'zh-CN': '东京最负盛名的购物娱乐区，云集奢侈品牌和传统百货公司。',
      'zh-TW': '東京最負盛名的購物娛樂區，雲集奢侈品牌和傳統百貨公司。',
      ko: '도쿄의 대표적인 고급 쇼핑가. 세계적인 럭셔리 브랜드와 전통있는 백화점이 즐비한 곳.',
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
    description: {
      en: 'The cultural heart of Ginza, famous for kabuki theater and traditional Japanese performing arts.',
      ja: '銀座の文化の中心地。歌舞伎座をはじめとする日本の伝統芸能の発信地。',
      'zh-CN': '银座的文化中心，以歌舞伎剧场和传统日本表演艺术闻名。',
      'zh-TW': '銀座的文化中心，以歌舞伎劇場和傳統日本表演藝術聞名。',
      ko: '긴자의 문화 중심지. 가부키자를 비롯한 일본 전통 예능의 본거지.',
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
    description: {
      en: 'Historic fish market area famous for sushi restaurants and food culture. Home to the Tsukiji Outer Market.',
      ja: '築地場外市場を中心とした食の街。新鮮な寿司店や食文化の発信地として世界的に有名。',
      'zh-CN':
        '历史悠久的鱼市场区域，以寿司餐厅和美食文化著称。筑地场外市场所在地。',
      'zh-TW':
        '歷史悠久的魚市場區域，以壽司餐廳和美食文化著稱。築地場外市場所在地。',
      ko: '쓰키지 외시장을 중심으로 한 먹거리 거리. 신선한 스시집과 식문화의 중심지로 세계적으로 유명.',
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
    description: {
      en: 'Historic commercial center since the Edo period. A financial district where tradition meets modernity.',
      ja: '江戸時代からの商業の中心地。現代と伝統が共存する金融街。',
      'zh-CN': '自江户时代以来的商业中心。传统与现代共存的金融区。',
      'zh-TW': '自江戶時代以來的商業中心。傳統與現代共存的金融區。',
      ko: '에도 시대부터 이어져 온 상업의 중심지. 현대와 전통이 공존하는 금융가.',
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
    description: {
      en: 'Traditional downtown area known for its old shops, temples, and authentic Japanese atmosphere.',
      ja: '江戸情緒が残る下町。老舗店舗や寺社が点在し、昔ながらの東京の雰囲気を味わえる。',
      'zh-CN': '传统的市中心区域，以古老商店、寺庙和纯正的日本氛围闻名。',
      'zh-TW': '傳統的市中心區域，以古老商店、寺廟和純正的日本氛圍聞名。',
      ko: '에도의 정취가 남아있는 시타마치. 오래된 가게와 신사가 점재하며 옛 도쿄의 분위기를 느낄 수 있는 곳.',
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
    description: {
      en: 'An emerging cultural area known for its art galleries, museums, and specialty coffee shops.',
      ja: 'アートギャラリーや美術館、こだわりのコーヒーショップが点在する新しい文化発信地。',
      'zh-CN': '新兴的文化区域，以艺术画廊、博物馆和精品咖啡店闻名。',
      'zh-TW': '新興的文化區域，以藝術畫廊、博物館和精品咖啡店聞名。',
      ko: '아트 갤러리와 미술관, 개성있는 커피숍이 점재하는 새로운 문화의 발신지.',
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
    description: {
      en: 'A vibrant entertainment district with shopping malls, restaurants, and concert halls.',
      ja: 'ショッピングモール、飲食店、コンサートホールを備えた賑わいのある複合エリア。',
      'zh-CN': '充满活力的娱乐区，拥有购物中心、餐厅和音乐厅。',
      'zh-TW': '充滿活力的娛樂區，擁有購物中心、餐廳和音樂廳。',
      ko: '쇼핑몰, 음식점, 콘서트홀을 갖춘 활기 넘치는 복합 지역.',
    },
    radius: 160,
    latitude: 35.6953134,
    longitude: 139.8140385,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1312/A131201/R3373/rstLst/1?SrtT=rt&LstRange=SF',
  },
] as const satisfies Area[]

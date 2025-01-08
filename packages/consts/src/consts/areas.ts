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
    areaId: 'shibuya',
    name: '渋谷',
    i18n: {
      en: 'Shibuya',
      ja: '渋谷',
      'zh-cn': '涩谷',
      'zh-tw': '澀谷',
      ko: '시부야',
    },
    description: {
      en: 'A bustling shopping and entertainment district known for its iconic scramble crossing and vibrant nightlife.',
      ja: 'シブヤスクランブル交差点や賑やかなナイトライフで有名な繁華街。',
      'zh-cn': '繁华的购物娱乐区，以标志性的十字路口和充满活力的夜生活闻名。',
      'zh-tw': '繁華的購物娛樂區，以標誌性的十字路口和充滿活力的夜生活聞名。',
      ko: '시부야 스크램블 교차로와 활기찬 나이트라이프로 유명한 번화가.',
    },
    radius: 500,
    latitude: 35.6583996,
    longitude: 139.7015313,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1303/A130301/R4698/rstLst/1/?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'shinjuku',
    name: '新宿',
    i18n: {
      en: 'Shinjuku',
      ja: '新宿',
      'zh-cn': '新宿',
      'zh-tw': '新宿',
      ko: '신주쿠',
    },
    description: {
      en: 'A major commercial and entertainment hub with skyscrapers, shopping centers, and a lively nightlife scene.',
      ja: '高層ビル、ショッピングセンター、賑やかなナイトライフが集まる大規模な商業エリア。',
      'zh-cn': '高楼大厦、购物中心和热闹的夜生活场所汇聚的主要商业和娱乐中心。',
      'zh-tw': '高樓大廈、購物中心和熱鬧的夜生活場所匯聚的主要商業和娛樂中心。',
      ko: '고층 빌딩, 쇼핑 센터, 활기찬 나이트라이프가 모여 있는 대규모 상업 지구.',
    },
    radius: 500,
    latitude: 35.6891956,
    longitude: 139.7002911,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1304/A130401/R5172/rstLst/1/?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'harajuku',
    name: '原宿',
    i18n: {
      en: 'Harajuku',
      ja: '原宿',
      'zh-cn': '原宿',
      'zh-tw': '原宿',
      ko: '하라주쿠',
    },
    description: {
      en: 'A trendy fashion district known for its youth culture, street fashion, and quirky boutiques.',
      ja: '若者文化、ストリートファッション、個性的なブティックが集まるトレンドファッションエリア。',
      'zh-cn': '以年轻文化、街头时尚和古怪精品店闻名的时尚区。',
      'zh-tw': '以年輕文化、街頭時尚和古怪精品店聞名的時尚區。',
      ko: '청춘 문화, 스트릿 패션, 독특한 부티크가 모이는 트렌디 패션 지구.',
    },
    radius: 500,
    latitude: 35.6696498,
    longitude: 139.7029734,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1306/A130601/R8072/rstLst/1/?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'omote-sando',
    name: '表参道',
    i18n: {
      en: 'Omote-sando',
      ja: '表参道',
      'zh-cn': '表参道',
      'zh-tw': '表參道',
      ko: '오모테산도',
    },
    description: {
      en: 'A tree-lined avenue known for its upscale shopping, luxury brands, and modern architecture.',
      ja: '高級ショッピング、ラグジュアリーブランド、モダンな建築が軒を連ねる並木道。',
      'zh-cn': '以高档购物、奢侈品牌和现代建筑闻名的林荫大道。',
      'zh-tw': '以高檔購物、奢侈品牌和現代建築聞名的林蔭大道。',
      ko: '고급 쇼핑, 럭셔리 브랜드, 현대적인 건축이 늘어선 은행나무길.',
    },
    radius: 500,
    latitude: 35.6651272,
    longitude: 139.7123703,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1306/A130602/R2153/rstLst/1/?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'roppongi',
    name: '六本木',
    i18n: {
      en: 'Roppongi',
      ja: '六本木',
      'zh-cn': '六本木',
      'zh-tw': '六本木',
      ko: '롯본기',
    },
    description: {
      en: 'An upscale entertainment district with international cuisine, art galleries, and luxury shopping.',
      ja: '国際的な料理、アートギャラリー、高級ショッピングが楽しめる高級エンターテイメントエリア。',
      'zh-cn': '高档娱乐区，提供国际美食、艺术画廊和奢侈购物体验。',
      'zh-tw': '高檔娛樂區，提供國際美食、藝術畫廊和奢侈購物體驗。',
      ko: '국제적인 요리, 아트 갤러리, 고급 쇼핑을 즐길 수 있는 고급 엔터테인먼트 지구.',
    },
    radius: 500,
    latitude: 35.6631835,
    longitude: 139.7322785,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1307/A130701/R10651/rstLst/1/?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'tokyo-station',
    name: '東京駅',
    i18n: {
      en: 'Tokyo Station',
      ja: '東京駅',
      'zh-cn': '东京站',
      'zh-tw': '東京站',
      ko: '도쿄역',
    },
    description: {
      en: 'The gateway to Tokyo. A beautiful red-brick building that combines historical architecture with a modern transportation hub.',
      ja: '東京の玄関口。歴史的な赤レンガ駅舎と最新の交通ハブが融合する象徴的な場所。',
      'zh-cn': '东京的门户。红砖建筑与现代交通枢纽融为一体的标志性建筑。',
      'zh-tw': '東京的門戶。紅磚建築與現代交通樞紐融為一體的標誌性建築。',
      ko: '도쿄의 관문. 역사적인 붉은 벽돌 건물과 현대적인 교통 허브가 조화를 이루는 상징적인 장소.',
    },
    radius: 300,
    latitude: 35.680743,
    longitude: 139.7682689,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1302/A130201/R6586/rstLst/1/?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'marunouchi',
    name: '丸の内',
    i18n: {
      en: 'Marunouchi',
      ja: '丸の内',
      'zh-cn': '丸之内',
      'zh-tw': '丸之內',
      ko: '마루노우치',
    },
    description: {
      en: "Tokyo's premier business district with modern skyscrapers, upscale shopping, and fine dining.",
      ja: '東京を代表するビジネス街。近代的な高層ビル群、高級ショッピング、上質なレストランが集まる。',
      'zh-cn': '东京的主要商务区，云集现代摩天大楼、高级购物中心和精致餐厅。',
      'zh-tw': '東京的主要商務區，雲集現代摩天大樓、高級購物中心和精緻餐廳。',
      ko: '도쿄를 대표하는 비즈니스 지구. 현대적인 고층 빌딩, 고급 쇼핑, 미식 레스토랑이 모여 있는 곳.',
    },
    radius: 300,
    latitude: 35.6816919,
    longitude: 139.7635604,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1302/A130201/R1786/rstLst/1/?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'ginza',
    name: '銀座',
    i18n: {
      en: 'Ginza',
      ja: '銀座',
      'zh-cn': '银座',
      'zh-tw': '銀座',
      ko: '긴자',
    },
    description: {
      en: "Tokyo's most prestigious shopping and entertainment district, home to luxury brands and traditional department stores.",
      ja: '東京を代表する高級ショッピング街。世界的なラグジュアリーブランドと老舗百貨店が軒を連ねる。',
      'zh-cn': '东京最负盛名的购物娱乐区，云集奢侈品牌和传统百货公司。',
      'zh-tw': '東京最負盛名的購物娛樂區，雲集奢侈品牌和傳統百貨公司。',
      ko: '도쿄의 대표적인 고급 쇼핑가. 세계적인 럭셔리 브랜드와 전통있는 백화점이 즐비한 곳.',
    },
    radius: 300,
    latitude: 35.6712552,
    longitude: 139.7650191,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1301/A130101/R3368/rstLst/1/?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'higashi-ginza',
    name: '東銀座',
    i18n: {
      en: 'Higashi-ginza',
      ja: '東銀座',
      'zh-cn': '东银座',
      'zh-tw': '東銀座',
      ko: '동긴자',
    },
    description: {
      en: 'The cultural heart of Ginza, famous for kabuki theater and traditional Japanese performing arts.',
      ja: '銀座の文化の中心地。歌舞伎座をはじめとする日本の伝統芸能の発信地。',
      'zh-cn': '银座的文化中心，以歌舞伎剧场和传统日本表演艺术闻名。',
      'zh-tw': '銀座的文化中心，以歌舞伎劇場和傳統日本表演藝術聞名。',
      ko: '긴자의 문화 중심지. 가부키자를 비롯한 일본 전통 예능의 본거지.',
    },
    radius: 300,
    latitude: 35.6694464,
    longitude: 139.7670348,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1301/A130101/R8188/rstLst/1/?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'tsukiji',
    name: '築地',
    i18n: {
      en: 'Tsukiji',
      ja: '築地',
      'zh-cn': '筑地',
      'zh-tw': '築地',
      ko: '쓰키지',
    },
    description: {
      en: 'Historic fish market area famous for sushi restaurants and food culture. Home to the Tsukiji Outer Market.',
      ja: '築地場外市場を中心とした食の街。新鮮な寿司店や食文化の発信地として世界的に有名。',
      'zh-cn':
        '历史悠久的鱼市场区域，以寿司餐厅和美食文化著称。筑地场外市场所在地。',
      'zh-tw':
        '歷史悠久的魚市場區域，以壽司餐廳和美食文化著稱。築地場外市場所在地。',
      ko: '쓰키지 외시장을 중심으로 한 먹거리 거리. 신선한 스시집과 식문화의 중심지로 세계적으로 유명.',
    },
    radius: 300,
    latitude: 35.6665341,
    longitude: 139.7705992,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1313/A131301/R6341/rstLst/1/?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'toyosu',
    name: '豊洲',
    i18n: {
      en: 'Toyosu',
      ja: '豊洲',
      'zh-cn': '丰洲',
      'zh-tw': '豐洲',
      ko: '토요스',
    },
    description: {
      en: 'A modern waterfront district known for its shopping malls, dining, and the Toyosu Fish Market.',
      ja: 'ショッピングモール、飲食店、豊洲市場があるモダンなウォーターフロントエリア。',
      'zh-cn': '以购物中心、餐饮和丰洲市场闻名的现代滨水区。',
      'zh-tw': '以購物中心、餐飲和豐洲市場聞名的現代濱水區。',
      ko: '쇼핑몰, 식당, 토요스 시장이 있는 현대적인 해안 지구.',
    },
    radius: 800,
    latitude: 35.6484531,
    longitude: 139.7898297,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1313/A131307/R6850/rstLst/1/?SrtT=rt',
  },
  {
    cityId: 'tokyo',
    areaId: 'asakusa',
    name: '浅草',
    i18n: {
      en: 'Asakusa',
      ja: '浅草',
      'zh-cn': '浅草',
      'zh-tw': '淺草',
      ko: '아사쿠사',
    },
    description: {
      en: 'A historic district known for Senso-ji Temple, traditional shops, and cultural festivals.',
      ja: '浅草寺、伝統的な商店、祭で有名な歴史的なエリア。',
      'zh-cn': '以浅草寺、传统商店和文化节日闻名的历史街区。',
      'zh-tw': '以淺草寺、傳統商店和文化節日聞名的歷史街區。',
      ko: '아사쿠사지, 전통 가게, 문화 축제로 유명한 역사적인 지구.',
    },
    radius: 500,
    latitude: 35.7128316,
    longitude: 139.7949532,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1311/A131102/R210/rstLst/1/?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'ueno',
    name: '上野',
    i18n: {
      en: 'Ueno',
      ja: '上野',
      'zh-cn': '上野',
      'zh-tw': '上野',
      ko: '우에노',
    },
    description: {
      en: 'A cultural district home to Ueno Park, museums, and a zoo. Known for its cherry blossoms in spring.',
      ja: '上野公園、美術館、動物園がある文化エリア。春の桜で有名。',
      'zh-cn': '文化区域，拥有上野公园、博物馆和动物园。以春季樱花闻名。',
      'zh-tw': '文化區域，擁有上野公園、博物館和動物園。以春季櫻花聞名。',
      ko: '우에노 공원, 박물관, 동물원이 있는 문화 지구. 봄에는 벚꽃으로 유명.',
    },
    radius: 500,
    latitude: 35.715393,
    longitude: 139.7741444,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1311/A131101/R1157/rstLst/1/?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'nihonbashi',
    name: '日本橋',
    i18n: {
      en: 'Nihonbashi',
      ja: '日本橋',
      'zh-cn': '日本桥',
      'zh-tw': '日本橋',
      ko: '니혼바시',
    },
    description: {
      en: 'Historic commercial center since the Edo period. A financial district where tradition meets modernity.',
      ja: '江戸時代からの商業の中心地。現代と伝統が共存する金融街。',
      'zh-cn': '自江户时代以来的商业中心。传统与现代共存的金融区。',
      'zh-tw': '自江戶時代以來的商業中心。傳統與現代共存的金融區。',
      ko: '에도 시대부터 이어져 온 상업의 중심지. 현대와 전통이 공존하는 금융가.',
    },
    radius: 300,
    latitude: 35.6823317,
    longitude: 139.773856,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1302/A130202/R7650/rstLst/1/?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'ningyocho',
    name: '人形町',
    i18n: {
      en: 'Ningyocho',
      ja: '人形町',
      'zh-cn': '人形町',
      'zh-tw': '人形町',
      ko: '닝교초',
    },
    description: {
      en: 'Traditional downtown area known for its old shops, temples, and authentic Japanese atmosphere.',
      ja: '江戸情緒が残る下町。老舗店舗や寺社が点在し、昔ながらの東京の雰囲気を味わえる。',
      'zh-cn': '传统的市中心区域，以古老商店、寺庙和纯正的日本氛围闻名。',
      'zh-tw': '傳統的市中心區域，以古老商店、寺廟和純正的日本氛圍聞名。',
      ko: '에도의 정취가 남아있는 시타마치. 오래된 가게와 신사가 점재하며 옛 도쿄의 분위기를 느낄 수 있는 곳.',
    },
    radius: 300,
    latitude: 35.6850407,
    longitude: 139.7834224,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1302/A130204/R7672/rstLst/1/?SrtT=rt&LstRange=SF',
  },
  {
    cityId: 'tokyo',
    areaId: 'kiyosumi-shirakawa',
    name: '清澄白河',
    i18n: {
      en: 'Kiyosumi-shirakawa',
      ja: '清澄白河',
      'zh-cn': '清澄白河',
      'zh-tw': '清澄白河',
      ko: '키요스미시라카와',
    },
    description: {
      en: 'An emerging cultural area known for its art galleries, museums, and specialty coffee shops.',
      ja: 'アートギャラリーや美術館、こだわりのコーヒーショップが点在する新しい文化発信地。',
      'zh-cn': '新兴的文化区域，以艺术画廊、博物馆和精品咖啡店闻名。',
      'zh-tw': '新興的文化區域，以藝術畫廊、博物館和精品咖啡店聞名。',
      ko: '아트 갤러리와 미술관, 개성있는 커피숍이 점재하는 새로운 문화의 발신지.',
    },
    radius: 500,
    latitude: 35.6799672,
    longitude: 139.8014225,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1313/A131303/R3341/rstLst/1/?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'kinshicho',
    name: '錦糸町',
    i18n: {
      en: 'Kinshicho',
      ja: '錦糸町',
      'zh-cn': '锦糸町',
      'zh-tw': '錦糸町',
      ko: '킨시쵸',
    },
    description: {
      en: 'A vibrant entertainment district with shopping malls, restaurants, and concert halls.',
      ja: 'ショッピングモール、飲食店、コンサートホールを備えた賑わいのある複合エリア。',
      'zh-cn': '充满活力的娱乐区，拥有购物中心、餐厅和音乐厅。',
      'zh-tw': '充滿活力的娛樂區，擁有購物中心、餐廳和音樂廳。',
      ko: '쇼핑몰, 음식점, 콘서트홀을 갖춘 활기 넘치는 복합 지역.',
    },
    radius: 500,
    latitude: 35.6953134,
    longitude: 139.8140385,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1312/A131201/R3373/rstLst/1?SrtT=rt&LstRange=SG',
  },
  {
    cityId: 'tokyo',
    areaId: 'narita-airport',
    name: '成田空港',
    i18n: {
      en: 'Narita Airport',
      ja: '成田空港',
      'zh-cn': '成田机场',
      'zh-tw': '成田機場',
      ko: '나리타 공항',
    },
    description: {
      en: 'Tokyo’s main international airport located in Narita, Chiba Prefecture.',
      ja: '千葉県成田市にある東京の主要国際空港。',
      'zh-cn': '位于千叶县成田市的东京主要国际机场。',
      'zh-tw': '位於千葉縣成田市的東京主要國際機場。',
      ko: '도쿄의 주요 국제공항으로, 치바현 나리타시에 위치해 있습니다.',
    },
    radius: 1000,
    latitude: 35.7714857,
    longitude: 140.3859824,
    tabelogUrl:
      'https://tabelog.com/chiba/A1204/A120401/R3402/rstLst/1/?SrtT=rt&LstRange=SB',
  },
  {
    cityId: 'tokyo',
    areaId: 'haneda-airport',
    name: '羽田空港',
    i18n: {
      en: 'Haneda Airport',
      ja: '羽田空港',
      'zh-cn': '羽田机场',
      'zh-tw': '羽田機場',
      ko: '하네다 공항',
    },
    description: {
      en: 'Tokyo’s main domestic airport located in Ota, Tokyo.',
      ja: '東京都大田区にある東京の主要国内空港。',
      'zh-cn': '位于东京大田区的东京主要国内机场。',
      'zh-tw': '位於東京大田區的東京主要國內機場。',
      ko: '도쿄의 주요 국내공항으로, 도쿄 도타구에 위치해 있습니다.',
    },
    radius: 1000,
    latitude: 35.5498431,
    longitude: 139.7863823,
    tabelogUrl:
      'https://tabelog.com/tokyo/A1315/A131504/R11717/rstLst/1/?SrtT=rt&LstRange=SB',
  },
] as const satisfies Area[]

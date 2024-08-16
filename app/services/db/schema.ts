import { sql } from 'drizzle-orm'
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const areas = sqliteTable('areas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  longitude: real('longitude').notNull(),
  latitude: real('latitude').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

export const googlePlaces = sqliteTable('google_places', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  types: text('types', { mode: 'json' }).notNull(),
  primaryType: text('primary_type').notNull(),
  raiting: real('raiting'),
  userRatingCount: real('user_rating_count'),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  displayName: text('display_name').notNull(),
  raw: text('raw', { mode: 'json' }).notNull(),
})

// {
//   "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI",
//   "id": "ChIJs0Np9eaLGGARjnZOVkTUWZI",
//   "types": [
//     "cafe",
//     "coffee_shop",
//     "meal_takeaway",
//     "restaurant",
//     "food",
//     "point_of_interest",
//     "store",
//     "establishment"
//   ],
//   "formattedAddress": "日本、〒104-0061 東京都中央区銀座５丁目８−５ ニュー銀座ビル １０号館 地下１階",
//   "location": {
//     "latitude": 35.670691999999995,
//     "longitude": 139.765319
//   },
//   "rating": 3.9,
//   "googleMapsUri": "https://maps.google.com/?cid=10545693392435574414",
//   "regularOpeningHours": {
//     "openNow": true,
//     "periods": [
//       {
//         "open": {
//           "day": 0,
//           "hour": 8,
//           "minute": 0
//         },
//         "close": {
//           "day": 0,
//           "hour": 21,
//           "minute": 0
//         }
//       },
//       {
//         "open": {
//           "day": 1,
//           "hour": 8,
//           "minute": 0
//         },
//         "close": {
//           "day": 1,
//           "hour": 21,
//           "minute": 0
//         }
//       },
//       {
//         "open": {
//           "day": 2,
//           "hour": 8,
//           "minute": 0
//         },
//         "close": {
//           "day": 2,
//           "hour": 21,
//           "minute": 0
//         }
//       },
//       {
//         "open": {
//           "day": 3,
//           "hour": 8,
//           "minute": 0
//         },
//         "close": {
//           "day": 3,
//           "hour": 21,
//           "minute": 0
//         }
//       },
//       {
//         "open": {
//           "day": 4,
//           "hour": 8,
//           "minute": 0
//         },
//         "close": {
//           "day": 4,
//           "hour": 21,
//           "minute": 0
//         }
//       },
//       {
//         "open": {
//           "day": 5,
//           "hour": 8,
//           "minute": 0
//         },
//         "close": {
//           "day": 5,
//           "hour": 21,
//           "minute": 0
//         }
//       },
//       {
//         "open": {
//           "day": 6,
//           "hour": 8,
//           "minute": 0
//         },
//         "close": {
//           "day": 6,
//           "hour": 21,
//           "minute": 0
//         }
//       }
//     ],
//     "weekdayDescriptions": [
//       "月曜日: 8時00分～21時00分",
//       "火曜日: 8時00分～21時00分",
//       "水曜日: 8時00分～21時00分",
//       "木曜日: 8時00分～21時00分",
//       "金曜日: 8時00分～21時00分",
//       "土曜日: 8時00分～21時00分",
//       "日曜日: 8時00分～21時00分"
//     ]
//   },
//   "businessStatus": "OPERATIONAL",
//   "priceLevel": "PRICE_LEVEL_MODERATE",
//   "userRatingCount": 654,
//   "displayName": {
//     "text": "ノアカフェ 銀座店"
//   },
//   "primaryTypeDisplayName": {
//     "text": "Cafe"
//   },
//   "primaryType": "cafe",
//   "shortFormattedAddress": "中央区銀座５丁目８−５ １０号館 地下１階 ニュー銀座ビル",
//   "editorialSummary": {
//     "text": "地下にある明るいカフェ。サンドイッチやサラダを提供し、季節のトッピングが楽しめるワッフルが有名。"
//   },
//   "reviews": [
//     {
//       "rating": 4,
//       "originalText": {
//         "text": "銀座４丁目の交差点を右に、１つ目の筋を右に入るとすぐ右手建物地下に位置しています。\n\n今回はモーニング利用★\nモーニングはお好きなドリンクに +300円 でワッフルかトーストを付けることが出来ます♪\nなので合計は大体1000円前後になりますね。\n\n僕はブレンドコーヒーとワッフルをチョイス✨\n\n店内はかなり込み合っており、セットのサラダが来るまで20分以上が経過、まぁ海外のお客様も多いのでそこは仕方なし(・ω・)\n\nセットドリンクはホットコーヒーでも先に来ます、食後に楽しみたい方は先に伝えたほうがいいかも？\n\nメインのワッフルが到着✨\nメイプルシロップがふんだんにかけられ、バターより柔らかいマーガリンみのあるクリームが上に乗っております♪\n\nクリームと一緒でも勿論美味しいのですが、個人的にはメイプルシロップがしっかり染み込んだワッフルのみを食べるのが好みでした♪\nふわサクッのワッフルに甘いメイプルシロップのハーモニー、とっても美味しいのです(^o^)♪\n\n立地的にも混みやすい辺りですが席数もあるので、ちょい軽食か空き時間にサクッと利用には入りやすい良いお店かなと思いました✨"
//       }
//     },
//     {
//       "rating": 4,
//       "originalText": {
//         "text": "銀座5丁目三越の向かいの地下にあるカフェ。\n\n喫煙席もあります。吸わない方もフロアの中で完全に分かれているので安心。\n\n禁煙席だけでも約50席あって広め。\n\n日曜の19時頃利用しましたが空いていました。地下だけど白が基調で照明も明るいので清潔感ある明るい店内。テーブルの盤面が大理石だったり、椅子やソファも綺麗な物が置かれていて高級感あり。テーブルを繋げば結構な人数でも利用できそうでした。\n\nフードのメニューはワッフル、サンドイッチ、ケーキのみでシンプル。\n\n今回注文したのはワッフルとカモミールティーのドリンクセット（¥1850）を注文。\n\nカモミールティーはかなり甘味を感じました。砂糖とかではなくお茶自体の優しい甘みだと思います。\n\nワッフル自体は甘さ控えめでカリカリ。アイスと生クリーム、ブルーベリージャムで甘さがちょうどよい感じでした。\n\nブルーベリーといちごジャムで見た目も綺麗。\n\n電波が悪いのでWi-Fiあり。BGMはかなり優しめなので話し声が響くのでワイワイはしない方がよさそうです。\n\n銀座はいいカフェがいっぱいあるので平均点ぐらい。デートでもみんなでの利用も特に問題ないと思います。"
//       }
//     },
//     {
//       "rating": 4,
//       "originalText": {
//         "text": "地下の隠れ家のような印象のカフェでした！\n土曜日のお昼過ぎにおうかがいして、少し並びました！\n\nワッフルとブレンドティーをいただきました。\nワッフルは外はサクサク、中はふわりとしていて口当たり良く、生クリームとバニラジェラートを添えてほおばると幸せになれます…！\nブレンドティーも大人の味わいで、スイーツと良く合うなと思います。ティープレスで提供されます。\n\n次回おうかがいするときは、他のスイーツも食べてみたいです！"
//       }
//     },
//     {
//       "rating": 2,
//       "originalText": {
//         "text": "マンゴーパフェやワッフルは美味しかった。\n家賃を加味しても水セルフやスマホ注文だし高いとは思う。\nそしてコバエが凄くてスイーツやコーヒーをゆっくり味わえなかったのは残念だった。\n実際にコバエがコーヒーに入ってたし、途中で別のコバエが新たにコーヒーに飛び込んでたし。。\n再来はないですね。"
//       }
//     },
//     {
//       "rating": 4,
//       "originalText": {
//         "text": "有楽町・銀座あたりに用事があり、以前友人に教えてもらったこちらのカフェを思い出し、久々に訪れました。\n\nこのエリアでショッピングをしていると、ちょこちょこ休憩を挟みたくなりますが、比較的どこも混んでいる中、こちらは席数も多いので入れることが多いイメージです。\n\n注文はモバイルオーダーで出来るので、店員さんを呼ばなくてもよいのも良きです。\n\n【注文内容】\n・チョコレートバナナワッフルSET：¥1,950\n・日替わりスープ：¥200\n合計：¥2,150\n\n※この日の日替わりスープはコーンスープでした。\n\n店員さんの気遣いも程よく、また利用したいと思います。"
//       }
//     }
//   ],
//   "photos": [
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_CsTJngRvZy8i65D10gXrtOo3PgpsJLo40XEeKuI8N8anUmHL3VQ8KwDOl8qNOJlBeuleoV5VQOzH0PRs8zTMx5sgkaOb0mK0b0uIU2JMEwR6YY0Yq_L6QpGfk2k4m2AHiTM9M74Fkq8ktsYkoDhI18uoNOl_jrp7zIr"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_CupunZZIIJMykTPXZISjLisKsQahdS_62JwPK37c2WDR62dUo5GM-DR8aHB6dDbr3Kny7XuvXHEJ3B0dBV0cB2p7bbq4BpnfGR3f3k9ZgEyI9pQx7B0FxvAiq2oNOHZN917MrGVDpMZ3IvjzJGIMk5ecGNy433IspcG"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_Cs123eVS6UBHz6zup80wcnx1gykLVddNgzHIhMZH_mr1FsGaLVrVPYrnhOkfVTuV53DKWItzLRsgLB2XLuQi3ORRPhyV8DEDCbbs2fVLVpKZq3gB252ByAItqQ8_6a61oA53RNHwIHutwWdlDK5WlUeILGOyW9_FWjt"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_Cv4EbibP2BTfIDCLmlMyGC8AhFZyfaKRLnJZlmIMc2NrWwrkRoeKLcsCzi88B6fX78FZAAMw6HqmqtnE-Z17pdd_wcFXXLbvUZyrY9BNxyBiD1SvyDurUGwvxNFg5W17tSk8VOEQ-vhHZ-OjUJQiK4ZAfxwbz4zJ6jk"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_Cv3AA0nsndKYd0qcLltOubin_oIDkP-KUvvNpfuXf7I5q3r1ubaCceAkKjYP5CpHT0-zti0rHj9zmSbe--zqudZJDhhRU9qhjxPCNKr7etQBlwjWWZAHzG_fHgMNAT64yPR798ZbBIdRWLgpL7jdbjOe2uHml-5wtL0"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_CvALo_31S7WLDfXT3orvWgeDq_N4EWHipieTzNRV0rH--aj-fraJD7ohYqES5iF3cdUkjQ1KBVxcKmnEAILunL5R5MtPdCf-G4KKzfoHa9edAyRczM1qcXx_ni8RClyv2S4HTLA5I4R4AhXYtGcxnzP7bAoeRvT4oWe"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_Cs5EeoHOlKOqs76S7YbTiYvUggymyXKQdqKz4OfVkkK-n3QkdLDieafqQAnUUTGBavvPA4jXXJhQUx7OkZN1Ar7J2Ioz-zRAqVBAw_aN9hcehfdi-20_-mhUA15Exra3iuBb_OjO4NLNC71DhSeomthLsubdFN4RIo7"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_CvyeyhpRsZ2pyXt91X8Bx50PBLn-dWd5nBiDSdwfHCvg0C4CXo26aG0is3619m-SpN6k0-h005caK4qCEnwPA-zECNoW9FZeSWYy344sBBLSuOedRsfC6d10dD_tVqvwrt6OUESuJ-60hxZhUcLXuTQJmZz82OC4kA6"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_CtF2NmfvuROrGr0WfnNvTMy35o8wu0iNn6bHzb2kO-WF0XOwld9ndqBzRvedqEMdfF7mbIln5MEFupXVCTEETGBCXaQxS_5t08K4i77dtW_GN5ZjAxdYkjmP0AIO5AVfojdMawtRraham0C3G0vEo55NiJZN4SP85qi"
//     },
//     {
//       "name": "places/ChIJs0Np9eaLGGARjnZOVkTUWZI/photos/AelY_Ctu7UeTZsx4wy1qgpWBvMSMaMXZsDvg3L8gApM0lFjsuXQDZYASVZRHvBr16pYskMuEbvEPRRZKPpOUliX3STK_PDLgzjUAVO3I8h0EQCYpZRliHSHIno5azMvpivygIK7QoYq8PGgfhSuYpy6rRlYKVeHRQmCUfRoS"
//     }
//   ],
//   "goodForChildren": false
// }

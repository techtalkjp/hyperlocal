import { cli, command } from 'cleye'
import { config } from 'dotenv'
import {
  crawlTabelog,
  localize,
  lookupGooglePlaceIds,
  retrievePlaceDetails,
  transform,
} from './commands'
config()

const argv = cli({
  commands: [
    // 食べログのデータをクロールする
    command(
      {
        name: '01_crawl-tabelog',
        parameters: ['[area ids...]'],
        flags: {
          delay: {
            type: Number,
            default: undefined,
            description: 'リクエスト間の遅延（秒）',
          },
          maxRequest: {
            type: Number,
            default: 10000,
            description: '最大リクエスト数',
          },
        },
      },
      async (argv) => await crawlTabelog(argv.flags, argv._.areaIds),
    ),
    // 食べログのデータをリスティング用のデータに変換する。ランキング外のデータは除外される
    command({ name: '02_transform' }, async () => await transform()),
    // Google Places APIを使ってリスティング用のデータにGoogle Place IDを付与する
    command(
      { name: '03_lookup-google-place-ids' },
      async () => await lookupGooglePlaceIds(),
    ),
    // Google Places APIを使ってGoogle Place IDから詳細情報を取得する
    command(
      {
        name: '04_retrieve-place-details',
      },
      async () => await retrievePlaceDetails(),
    ),
    // 翻訳してローカライズする
    command(
      {
        name: '05_localize',
        parameters: ['<area ids...>'],
      },
      async (argv) => await localize(argv._.areaIds),
    ),
  ],
})

if (argv.command === undefined) {
  argv.showHelp()
}

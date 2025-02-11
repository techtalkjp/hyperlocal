import { defineCommand, runMain } from 'citty'
import consola from 'consola'
import { config } from 'dotenv'

config()

const main = defineCommand({
  meta: {
    name: 'crawler',
    version: '0.1.0',
    description: 'crawler cli',
  },
  setup: () => {
    consola.debug('setup')
  },
  cleanup: () => {
    consola.debug('cleanup')
  },
  subCommands: {
    // 01. 食べログのデータをクロールする
    crawlTabelog: (await import('./commands/crawl-tabelog')).default,
    // 02. 食べログのデータをリスティング用のデータに変換する。ランキング外のデータは除外される
    transform: (await import('./commands/transform')).default,
    // 03. Google Places APIを使ってリスティング用のデータにGoogle Place IDを付与する
    lookupGooglePlaceIds: (await import('./commands/lookup-google-place-ids'))
      .default,
    // 04. Google Place API で詳細情報を取得
    retrievePlaceDetails: (await import('./commands/retrieve-place-details'))
      .default,
    // 05. 翻訳してローカライズする
    localize: (await import('./commands/localize')).default,
  },
})

await runMain(main)

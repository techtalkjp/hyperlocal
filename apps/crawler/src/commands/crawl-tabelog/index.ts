import { areas } from '@hyperlocal/consts'
import { defineCommand } from 'citty'
import consola from 'consola'
import { CheerioCrawler, Dataset, log } from 'crawlee'
import { HandlerLabel, router } from './handlers'

export default defineCommand({
  meta: {
    name: 'crawl-tabelog',
    description: '食べログのデータをクロールする',
  },
  args: {
    delay: {
      type: 'string',
      description: 'リクエスト間の遅延（秒）',
      default: undefined,
    },
    max: {
      type: 'string',
      description: '最大リクエスト数',
      default: undefined,
    },
    all: {
      type: 'boolean',
      description: '全てのエリアをクロールする',
    },
  },
  run: async ({ args }) => {
    const delay = args.delay ? Number.parseInt(args.delay) : undefined
    const maxRequest = args.max ? Number.parseInt(args.max) : undefined
    await crawlTabelog({ delay, maxRequest, all: args.all }, [])
  },
})

const crawlTabelog = async (
  opts: {
    delay?: number
    maxRequest?: number
    all?: boolean
  },
  areaIds: string[],
) => {
  log.setLevel(log.LEVELS.INFO)
  if (!opts.all && areaIds.length === 0) {
    consola.error('No area ids specified')
    consola.info('Available area ids:')
    for (const area of areas) {
      consola.info(`- ${area.areaId}`)
    }
    return
  }

  const crawler = new CheerioCrawler({
    requestHandler: router,
    maxRequestsPerCrawl: opts.maxRequest,
    sameDomainDelaySecs: opts.delay,
  })

  // データセットをパージ
  const restaurantDataset = await Dataset.open('restaurant')
  await restaurantDataset.drop()
  const reviewDataset = await Dataset.open('review')
  await reviewDataset.drop()

  for (const area of areas) {
    if (!opts.all && !areaIds.includes(area.areaId)) {
      continue
    }

    await crawler.addRequests([
      {
        url: area.tabelogUrl,
        label: HandlerLabel.RESTAURANT_LIST,
        userData: { area: area.areaId },
      },
    ])
  }

  await crawler.run()
}

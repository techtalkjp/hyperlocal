import { areas } from '@hyperlocal/consts'
import { CheerioCrawler, Dataset, log } from 'crawlee'
import { HandlerLabel, router } from './handlers'

log.setLevel(log.LEVELS.INFO)

export const crawlTabelog = async (
  opts: {
    delay?: number
    maxRequest?: number
    all?: boolean
  },
  areaIds: string[],
) => {
  if (!opts.all && areaIds.length === 0) {
    console.log('No area ids specified')
    console.log('Available area ids:')
    for (const area of areas) {
      console.log(`- ${area.areaId}`)
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

import { areas } from '@hyperlocal/consts'
import { CheerioCrawler, Dataset, log } from 'crawlee'
import { HandlerLabel, router } from './handlers'

log.setLevel(log.LEVELS.INFO)

export const crawlTabelog = async (opts: {
  delay?: number
  maxRequest?: number
}) => {
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

  await crawler.addRequests(
    areas.map((area) => ({
      url: area.tabelogUrl,
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: area.areaId },
    })),
  )

  await crawler.run()
}

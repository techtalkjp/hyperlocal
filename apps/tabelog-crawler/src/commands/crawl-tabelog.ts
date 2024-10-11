import { CheerioCrawler, Dataset, log } from 'crawlee'
import { HandlerLabel, router } from './crawl-tabelog-handlers'

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

  await crawler.addRequests([
    {
      url: 'https://tabelog.com/tokyo/A1302/A130201/R6586/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'tokyo-station' },
    },
    {
      url: 'https://tabelog.com/tokyo/C13101/C36087/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'marunouchi' },
    },
    {
      url: 'https://tabelog.com/tokyo/A1301/A130101/R3368/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'ginza' },
    },
    {
      url: 'https://tabelog.com/tokyo/A1301/A130101/R8188/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'higashi-ginza' },
    },
    {
      url: 'https://tabelog.com/tokyo/A1313/A131301/R6341/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'tsukiji' },
    },
    {
      url: 'https://tabelog.com/tokyo/A1302/A130202/R7650/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'nihonbashi' },
    },
    {
      url: 'https://tabelog.com/tokyo/A1302/A130204/R7672/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'ningyocho' },
    },
    {
      url: 'https://tabelog.com/tokyo/A1313/A131303/R3341/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'kiyosumi-shirakawa' },
    },
    {
      url: 'https://tabelog.com/tokyo/A1312/A131201/R3373/rstLst/1?SrtT=rt&LstRange=SF',
      label: HandlerLabel.RESTAURANT_LIST,
      userData: { area: 'kinshicho' },
    },
  ])

  await crawler.run()
}

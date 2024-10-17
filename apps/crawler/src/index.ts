import { cli, command } from 'cleye'
import { config } from 'dotenv'
import {
  crawlTabelog,
  lookupGooglePlaceIds,
  retrievePlaceDetails,
  stats,
  transform,
  translate,
} from './commands'
config()

const argv = cli({
  commands: [
    command(
      {
        name: 'crawl-tabelog',
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
      async (argv) => await crawlTabelog(argv.flags),
    ),
    command({ name: 'transform' }, async () => await transform()),
    command(
      { name: 'lookup-google-place-ids' },
      async () => await lookupGooglePlaceIds(),
    ),
    command(
      {
        name: 'retrieve-place-details',
      },
      async () => await retrievePlaceDetails(),
    ),
    command(
      {
        name: 'translate',
        parameters: ['<area ids...>'],
      },
      async (argv) => await translate(argv._.areaIds),
    ),
    command({ name: 'stats' }, async () => await stats()),
  ],
})

if (argv.command === undefined) {
  argv.showHelp()
}

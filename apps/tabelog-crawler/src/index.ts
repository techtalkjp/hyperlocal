import { cli, command } from 'cleye'
import { config } from 'dotenv'
import { crawlTabelog, mapping, ranking, stats } from './commands'
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
      (argv) => crawlTabelog(argv.flags),
    ),
    command(
      {
        name: 'ranking',
        flags: {
          area: { type: String, description: '対象エリア', default: 'ginza' },
        },
      },
      (argv) => ranking(argv.flags),
    ),
    command({ name: 'mapping' }, () => mapping()),
    command({ name: 'stats' }, () => stats()),
  ],
})

if (argv.command === undefined) {
  argv.showHelp()
}

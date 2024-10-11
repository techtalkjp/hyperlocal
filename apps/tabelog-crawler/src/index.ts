import { cli, command } from 'cleye'
import { config } from 'dotenv'
import { crawlTabelog, mapping, ranking, stats } from './commands'
config()

const argv = cli({
  commands: [
    command(
      { name: 'crawl-tabelog', flags: { delay: Number, maxRequest: Number } },
      (argv) => crawlTabelog(argv.flags),
    ),
    command({ name: 'ranking' }, () => ranking()),
    command({ name: 'mapping' }, () => mapping()),
    command({ name: 'stats' }, () => stats()),
  ],
})

if (argv.command === undefined) {
  argv.showHelp()
}

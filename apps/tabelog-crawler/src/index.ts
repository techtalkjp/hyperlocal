import { cli, command } from 'cleye'
import { config } from 'dotenv'
import { crawlTabelog, ranking } from './commands'
import { crawlGoogleMaps } from './commands/crawl-google-maps'
import { mapping } from './commands/mapping'
config()

const argv = cli({
  commands: [
    command(
      { name: 'crawl-tabelog', flags: { delay: Number, maxRequest: Number } },
      (argv) => crawlTabelog(argv.flags),
    ),
    command({ name: 'crawl-google-maps' }, () => crawlGoogleMaps()),
    command({ name: 'ranking' }, () => ranking()),
    command({ name: 'mapping' }, () => mapping()),
  ],
})

if (argv.command === undefined) {
  argv.showHelp()
}

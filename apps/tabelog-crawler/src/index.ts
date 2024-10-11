import { cli, command } from 'cleye'
import { crawl, update } from './commands'

const argv = cli({
  commands: [
    command(
      { name: 'crawl', flags: { delay: Number, maxRequest: Number } },
      (argv) => crawl(argv.flags),
    ),
    command({ name: 'update' }, () => update()),
  ],
})
if (argv.command === undefined) {
  argv.showHelp()
}

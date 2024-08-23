import { setTimeout } from 'node:timers/promises'

const seed = async () => {
  console.log('seed')
  await setTimeout(100)
  // nop
}

await seed()

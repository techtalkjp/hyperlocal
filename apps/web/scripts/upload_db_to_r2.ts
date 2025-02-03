import fs from 'node:fs/promises'
import '~/services/env.server'
import { put } from '~/services/r2.server'

const dbFilePath = new URL(process.env.DATABASE_URL).pathname
const dbFile = await fs.readFile(dbFilePath)
const ret = await put('db/hyperlocal.db', dbFile)

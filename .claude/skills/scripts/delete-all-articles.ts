#!/usr/bin/env tsx
import { db } from '../../../packages/db/src/index.js'

async function deleteAll() {
  const result = await db.deleteFrom('areaArticles').execute()
  console.log('✓ Deleted all articles from database')
  console.log('Rows affected:', result)
}

deleteAll().catch(console.error)

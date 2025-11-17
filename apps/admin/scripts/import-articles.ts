#!/usr/bin/env tsx
import { db } from '@hyperlocal/db'
import { createId } from '@paralleldrive/cuid2'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import '../app/services/env.server'
import { compileMDX } from '../app/services/mdx.server'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ARTICLES_DIR = join(__dirname, '../../../content/articles')

type ArticleData = {
  area: string
  scene: string
  language: string
  title: string
  description: string
  content: string
  status: 'draft' | 'published'
  city?: string
}

const deleteExistingArticle = async (
  cityId: string,
  areaId: string,
  sceneId: string,
  language: string,
) => {
  const deleted = await db
    .deleteFrom('areaArticles')
    .where('cityId', '=', cityId)
    .where('areaId', '=', areaId)
    .where('sceneId', '=', sceneId)
    .where('language', '=', language)
    .execute()
  return deleted
}

const createArticle = async (data: {
  cityId: string
  areaId: string
  sceneId: string
  language: string
  title: string
  content: string
  compiledCode: string
  metadata: string
  status: string
}) => {
  const article = await db
    .insertInto('areaArticles')
    .values({
      id: createId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  return article
}

async function main() {
  console.log('\n📦 Importing articles from content/articles/\n')

  // Read all JSON files from content/articles
  const files = await readdir(ARTICLES_DIR)
  const jsonFiles = files.filter((f) => f.endsWith('.json'))

  console.log(`Found ${jsonFiles.length} article files\n`)

  let imported = 0
  let updated = 0
  let errors = 0

  for (const file of jsonFiles) {
    try {
      const filePath = join(ARTICLES_DIR, file)
      const fileContent = await readFile(filePath, 'utf-8')
      const articleData: ArticleData = JSON.parse(fileContent)

      const cityId = articleData.city || 'tokyo'

      console.log(`Processing: ${file}`)
      console.log(`  Area: ${articleData.area}`)
      console.log(`  Scene: ${articleData.scene}`)
      console.log(`  Language: ${articleData.language}`)
      console.log(`  Title: ${articleData.title}`)

      // Compile MDX
      console.log('  🔨 Compiling MDX...')
      if (!articleData.content) {
        console.error('  ✗ No content to compile')
        errors++
        continue
      }
      const compiledCode = await compileMDX(articleData.content)
      console.log('  ✓ MDX compiled')

      // Delete existing article
      const deleteResult = await deleteExistingArticle(
        cityId,
        articleData.area,
        articleData.scene,
        articleData.language,
      )

      if (deleteResult.length > 0) {
        console.log(`  ✓ Deleted ${deleteResult.length} existing article(s)`)
        updated++
      } else {
        console.log('  ✓ No existing article found (new)')
        imported++
      }

      // Create new article
      const article = await createArticle({
        cityId,
        areaId: articleData.area,
        sceneId: articleData.scene,
        language: articleData.language,
        title: articleData.title,
        content: articleData.content,
        compiledCode,
        metadata: JSON.stringify({ description: articleData.description }),
        status: articleData.status,
      })

      console.log(`  ✓ Created article: ${article.id}`)
      console.log()
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error)
      errors++
      console.log()
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Summary:')
  console.log(`  New articles: ${imported}`)
  console.log(`  Updated articles: ${updated}`)
  console.log(`  Total processed: ${imported + updated}`)
  if (errors > 0) {
    console.log(`  Errors: ${errors}`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(console.error)

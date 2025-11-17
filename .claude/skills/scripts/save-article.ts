#!/usr/bin/env tsx
import { parseArgs } from 'node:util'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    area: { type: 'string', short: 'a' },
    scene: { type: 'string', short: 's' },
    language: { type: 'string', short: 'l', default: 'ja' },
    stdin: { type: 'boolean', default: false },
  },
  allowPositionals: true,
  strict: false,
})

async function main() {
  let article: {
    area: string
    scene: string
    language: string
    title: string
    description: string
    content: string
    status: string
  } | null = null

  if (values.stdin) {
    // Read JSON from stdin
    const stdinData = readFileSync(0, 'utf-8')
    const input = JSON.parse(stdinData)

    article = {
      area: values.area || input.area,
      scene: values.scene || input.scene,
      language: values.language || input.language || 'ja',
      title: input.title,
      description: input.description,
      content: input.content,
      status: input.status || 'published',
    }
  } else if (positionals.length > 0) {
    // Read from file
    const inputFile = positionals[0]
    const fileContent = readFileSync(inputFile, 'utf-8')
    const input = JSON.parse(fileContent)

    article = {
      area: values.area || input.area,
      scene: values.scene || input.scene,
      language: values.language || input.language || 'ja',
      title: input.title,
      description: input.description,
      content: input.content,
      status: input.status || 'published',
    }
  } else {
    console.error('Error: Please provide input via --stdin or as a file argument')
    console.error('\nUsage:')
    console.error('  echo \'{"title":"...","description":"...","content":"..."}\' | npx tsx save-article.ts --area asakusa --scene morning-cafe --stdin')
    console.error('  npx tsx save-article.ts article.json')
    process.exit(1)
  }

  if (!article) {
    console.error('Error: Failed to load article data')
    process.exit(1)
  }

  if (!article.area) {
    console.error('Error: --area is required (or include in JSON)')
    process.exit(1)
  }

  if (!article.scene) {
    console.error('Error: --scene is required (or include in JSON)')
    process.exit(1)
  }

  if (!article.title || !article.description || !article.content) {
    console.error('Error: title, description, and content are required in the JSON')
    process.exit(1)
  }

  const filename = `${article.area}-${article.scene}.json`
  const filepath = `content/articles/${filename}`

  // Ensure directory exists
  mkdirSync(dirname(filepath), { recursive: true })

  // Write JSON file
  writeFileSync(filepath, JSON.stringify(article, null, 2), 'utf-8')

  console.log(`✓ Article saved to: ${filepath}`)
  console.log(`\nTo register this article, run:`)
  console.log(
    `pnpm --filter @hyperlocal/admin generate:article --file ${filepath}`,
  )
}

main().catch(console.error)

#!/usr/bin/env tsx
import { areas, languages, scenes } from '@hyperlocal/consts'
import { parseArgs } from 'node:util'
import { createArticle } from '../app/routes/_admin+/articles.new/queries.server'
import '../app/services/env.server'

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    area: { type: 'string', short: 'a' },
    scene: { type: 'string', short: 's' },
    language: { type: 'string', short: 'l', default: 'ja' },
    status: { type: 'string', default: 'published' },
    city: { type: 'string', default: 'tokyo' },
    title: { type: 'string', short: 't' },
    content: { type: 'string' },
    description: { type: 'string', short: 'd' },
    file: { type: 'string', short: 'f' },
    list: { type: 'boolean' },
  },
  strict: true,
})

// List available options
if (values.list) {
  console.log('\n📍 Available Areas:')
  areas.forEach((area) => {
    console.log(`  ${area.areaId.padEnd(25)} - ${area.name} (${area.i18n.en})`)
  })

  console.log('\n🎬 Available Scenes:')
  scenes.forEach((scene) => {
    console.log(
      `  ${scene.id.padEnd(25)} - ${scene.i18n.ja} (${scene.i18n.en})`,
    )
  })

  console.log('\n🌐 Available Languages:')
  languages.forEach((lang) => {
    console.log(`  ${lang.id.padEnd(25)} - ${lang.displayName}`)
  })

  process.exit(0)
}

// Load from JSON file if provided
let articleData: {
  area?: string
  scene?: string
  language?: string
  title?: string
  description?: string
  content?: string
  status?: string
  city?: string
} = {}

if (values.file && values.file.endsWith('.json')) {
  const fs = await import('node:fs/promises')
  console.log(`\n📄 Loading article data from: ${values.file}`)
  const fileContent = await fs.readFile(values.file, 'utf-8')
  articleData = JSON.parse(fileContent)
  console.log('  ✅ JSON data loaded')
}

// Merge file data with command line arguments (CLI args take precedence)
const area = values.area || articleData.area
const scene = values.scene || articleData.scene
const language = values.language || articleData.language || 'ja'
const title = values.title || articleData.title
const description = values.description || articleData.description
const status = (values.status || articleData.status || 'published') as
  | 'draft'
  | 'published'
const city = values.city || articleData.city || 'tokyo'

// Validate required arguments
if (!area || !scene || !title) {
  console.error('❌ Error: --area, --scene, and --title are required')
  console.log('\nUsage:')
  console.log(
    '  pnpm generate:article --area <area-id> --scene <scene-id> --title <title> [options]',
  )
  console.log('  pnpm generate:article --file <article.json>')
  console.log('\nOptions:')
  console.log('  -a, --area <id>        Area ID (required)')
  console.log('  -s, --scene <id>       Scene ID (required)')
  console.log('  -t, --title <text>     Article title (required)')
  console.log('  -l, --language <id>    Language ID (default: ja)')
  console.log('  -d, --description <text>  Meta description')
  console.log('  --content <text>       Article content (MDX)')
  console.log('  -f, --file <path>      Read from JSON file or MDX file')
  console.log(
    '  --status <status>      Article status: draft|published (default: published)',
  )
  console.log('  --city <id>            City ID (default: tokyo)')
  console.log('  --list                 List all available options')
  console.log('\nExamples:')
  console.log('  # From JSON file (all-in-one)')
  console.log('  pnpm generate:article --file article.json')
  console.log('')
  console.log('  # From MDX file with metadata')
  console.log(
    '  pnpm generate:article --area kiyosumi-shirakawa --scene afternoon-break \\',
  )
  console.log('    --title "午後のカフェタイム" --file article.mdx')
  process.exit(1)
}

// Find area and scene
const areaObj = areas.find((a) => a.areaId === area)
const sceneObj = scenes.find((s) => s.id === scene)

if (!areaObj) {
  console.error(`❌ Error: Area '${area}' not found`)
  console.log('Run with --list to see available areas')
  process.exit(1)
}

if (!sceneObj) {
  console.error(`❌ Error: Scene '${scene}' not found`)
  console.log('Run with --list to see available scenes')
  process.exit(1)
}

// Get content from file, article data, or argument
let content: string
if (articleData.content) {
  content = articleData.content
} else if (values.file && !values.file.endsWith('.json')) {
  const fs = await import('node:fs/promises')
  console.log(`\n📄 Reading content from: ${values.file}`)
  content = await fs.readFile(values.file, 'utf-8')
} else if (values.content) {
  content = values.content
} else {
  console.error('❌ Error: Either --content or --file must be provided')
  process.exit(1)
}

console.log('\n🚀 Creating article...')
console.log(`  Area: ${areaObj.name} (${areaObj.i18n.en})`)
console.log(`  Scene: ${sceneObj.i18n.ja} (${sceneObj.i18n.en})`)
console.log(`  Language: ${language}`)
console.log(`  Title: ${title}`)
console.log(`  Status: ${status}`)

// Save article
console.log('\n💾 Saving article...')
const article = await createArticle({
  cityId: city,
  areaId: areaObj.areaId,
  sceneId: sceneObj.id,
  language,
  title,
  content,
  metadata: JSON.stringify({ description: description || '' }),
  status,
})

console.log('  ✅ Article saved')
console.log(`  ID: ${article.id}`)
console.log(`  Status: ${article.status}`)

console.log('\n✨ Done!')
console.log(`\nView article:`)
console.log(`  Admin: http://localhost:5173/articles/${article.id}`)
console.log(
  `  Web: http://localhost:5174/${language}/area/${areaObj.areaId}/guide/${sceneObj.id}`,
)

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

interface Article {
  area: string
  scene: string
  language: string
  title: string
  description: string
  content: string
  status: string
}

const languageNames = {
  en: 'English',
  ko: 'Korean',
  'zh-cn': 'Simplified Chinese',
  'zh-tw': 'Traditional Chinese',
}

async function translateArticle(
  article: Article,
  targetLanguage: keyof typeof languageNames,
): Promise<Article> {
  const languageName = languageNames[targetLanguage]

  const prompt = `Translate the following Japanese article about local area guides to ${languageName}.

Important guidelines:
- Keep the <Place id="..." /> tags exactly as they are (do not translate)
- Translate the title, description, and content
- Maintain the same tone and style
- Keep markdown formatting including headers (#, ##) and line breaks
- For place names and area names, use commonly used ${languageName} names if they exist, otherwise keep Japanese romanization
- For ${languageName === 'English' ? 'English' : languageName}, use natural, engaging language that appeals to international travelers

Original article:
Title: ${article.title}
Description: ${article.description}
Content:
${article.content}

Please respond with a JSON object containing only the translated fields:
{
  "title": "translated title",
  "description": "translated description",
  "content": "translated content"
}
`

  const result = await generateText({
    model: google('gemini-2.5-flash'),
    prompt,
  })

  const responseText = result.text

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || [
    '',
    responseText,
  ]
  const jsonText = jsonMatch[1] || responseText

  const translated = JSON.parse(jsonText)

  return {
    area: article.area,
    scene: article.scene,
    language: targetLanguage,
    title: translated.title,
    description: translated.description,
    content: translated.content,
    status: 'published',
  }
}

async function main() {
  const articlesDir = path.join(__dirname, '../../../content/articles')
  const files = fs.readdirSync(articlesDir)

  // Filter Japanese articles only
  const jaFiles = files.filter((file) => {
    if (!file.endsWith('.json')) return false
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8')
    const article = JSON.parse(content)
    return article.language === 'ja'
  })

  console.log(`Found ${jaFiles.length} Japanese articles to translate\n`)

  const targetLanguages: Array<keyof typeof languageNames> = [
    'en',
    'ko',
    'zh-cn',
    'zh-tw',
  ]

  let totalTranslated = 0

  for (const file of jaFiles) {
    const filePath = path.join(articlesDir, file)
    const article: Article = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    console.log(`\nTranslating: ${file}`)
    console.log(`  Area: ${article.area}`)
    console.log(`  Scene: ${article.scene}`)
    console.log(`  Title: ${article.title}`)

    for (const targetLang of targetLanguages) {
      try {
        console.log(`  → Translating to ${languageNames[targetLang]}...`)

        const translated = await translateArticle(article, targetLang)

        // Create filename with language suffix
        const baseFilename = file.replace('.json', '')
        const translatedFilename = `${baseFilename}.${targetLang}.json`
        const translatedPath = path.join(articlesDir, translatedFilename)

        fs.writeFileSync(translatedPath, JSON.stringify(translated, null, 2))

        console.log(`     ✓ Saved: ${translatedFilename}`)
        totalTranslated++

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(
          `     ✗ Error translating to ${languageNames[targetLang]}:`,
          error,
        )
      }
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Summary:`)
  console.log(`  Source articles: ${jaFiles.length}`)
  console.log(`  Translated articles: ${totalTranslated}`)
  console.log(
    `  Expected: ${jaFiles.length * targetLanguages.length} (${jaFiles.length} × ${targetLanguages.length})`,
  )
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

main().catch(console.error)

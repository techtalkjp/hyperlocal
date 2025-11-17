import { google } from '@ai-sdk/google'
import type { Area, Scene } from '@hyperlocal/consts'
import { generateObject } from 'ai'
import { z } from 'zod'

interface PlaceData {
  id: string
  displayName: string
  rating: number
  userRatingCount: number
  priceLevel?: string
  reviews: Array<{ text: string }>
}

const schema = z.object({
  title: z.string(),
  content: z.string(),
  description: z.string(),
})

export const generateArticle = async ({
  area,
  scene,
  language,
  places,
}: {
  area: Area
  scene: Scene
  language: string
  places: PlaceData[]
}) => {
  const languageMap: Record<string, string> = {
    ja: '日本語',
    en: 'English',
    ko: '한국어',
    'zh-cn': '简体中文',
    'zh-tw': '繁體中文',
  }
  const targetLang = languageMap[language] || language

  const system = `
You are a local food guide writer specializing in creating engaging, experience-focused articles about Tokyo's dining scenes.

Generate an article in ${targetLang} about ${area.name} area with a focus on the ${scene.i18n[language as keyof typeof scene.i18n]} scene.

Article Requirements:
1. Write in a natural, storytelling style that sounds like a local friend sharing recommendations
2. Focus on the unique atmosphere and local character of ${area.name}
3. Tailor recommendations to the ${scene.i18n[language as keyof typeof scene.i18n]} use case
4. Use MDX format with embedded <Place id="PLACE_ID" /> components for restaurant recommendations
5. Include 3-5 place recommendations with context about why they're good for this scene
6. Write in ${targetLang} naturally (not a translation)

Structure:
- Opening paragraph: Set the scene and atmosphere of ${area.name}
- Body: Introduce each place with <Place id="..." /> components and explain why it fits the scene
- Closing: Brief summary of what makes this area special for this scene

Tone: Friendly, informative, authentic. Like a local sharing insider tips.

DO NOT:
- Use generic phrases or clichés
- Simply list features
- Include pricing unless it's notably unique
- Mention specific dates or limited-time offers
`

  const placesInfo = places
    .slice(0, 10)
    .map(
      (p, idx) =>
        `${idx + 1}. ${p.displayName} (ID: ${p.id})
   Rating: ${p.rating}/5.0 (${p.userRatingCount} reviews)
   ${p.priceLevel ? `Price: ${p.priceLevel}` : ''}
   Sample review: ${p.reviews[0]?.text?.substring(0, 200) || 'No reviews'}`,
    )
    .join('\n\n')

  const prompt = `
Area: ${area.name} (${area.i18n.en})
Location: ${area.latitude}, ${area.longitude}
Area Description: ${area.description?.[language as keyof typeof area.description] || area.description?.en || ''}

Scene: ${scene.i18n[language as keyof typeof scene.i18n]}
Scene Description: ${scene.description[language as keyof typeof scene.description]}

Available Places:
${placesInfo}

Generate an engaging ${targetLang} article about experiencing ${area.name} for this ${scene.i18n[language as keyof typeof scene.i18n]} scene.
Use <Place id="..." /> components to embed place cards in the article.
`

  const model = google('gemini-2.5-flash-lite')
  const result = await generateObject({
    model,
    maxRetries: 3,
    schema,
    system,
    prompt,
    mode: 'json',
  })

  return {
    title: result.object.title,
    content: result.object.content,
    metadata: {
      description: result.object.description,
    },
  }
}

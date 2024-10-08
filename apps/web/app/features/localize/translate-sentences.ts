import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

// 翻訳の出力
const schema = z.object({
  translation: z.string(),
})

export const translateSentences = async ({
  sentence,
  source,
  target,
}: {
  sentence: string
  source: string
  target: string
}) => {
  const system = `
Translate the following ${source} place names and review texts into ${target}.
Preserve the original meaning and tone of the reviews while ensuring they sound natural in ${source}.

Pay special attention to:
1. Accurate translation of place names, considering their cultural context
2. Maintaining the nuances and sentiment of the original reviews
3. Using appropriate ${target} characters and expressions`
  const prompt = `
Original ${source}: ${sentence}`

  const model = google('gemini-1.5-flash-latest')
  const result = await generateObject({
    model,
    maxRetries: 3,
    schema,
    system,
    prompt,
    mode: 'json',
  })

  return result.object.translation
}

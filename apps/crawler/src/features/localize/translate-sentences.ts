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
3. Using appropriate ${target} characters and expressions

Content Rules:

Remove:
- Policy-violating content
- Inappropriate language
- Personal information
- Multiple language mixing
- Excessive symbols/emoji
- Promotional content
- Platform-specific comments

Keep:
- Genuine visitor experiences
- Cultural observations
- Relevant details only

Ensure proper ${target} grammar and writing conventions.

`
  const prompt = `
Original ${source}: ${sentence}`

  const model = google('gemini-2.0-flash-lite-preview-02-05')
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

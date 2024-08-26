import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import languages from '~/assets/languages.json'
import type { GooglePlace } from '~/services/db'

export function isValidZodLiteralUnion<T extends z.ZodLiteral<unknown>>(
  literals: T[],
): literals is [T, T, ...T[]] {
  return literals.length >= 2
}
export function constructZodLiteralUnionType<T extends z.ZodLiteral<unknown>>(
  literals: T[],
) {
  if (!isValidZodLiteralUnion(literals)) {
    throw new Error(
      'Literals passed do not meet the criteria for constructing a union schema, the minimum length is 2',
    )
  }
  return z.union(literals)
}

const schema = z.object({
  displayName: z.string(),
  reviews: z.array(
    z.object({
      rating: z.number(),
      text: z.string().optional(),
    }),
  ),
})

export const translatePlace = async (
  place: GooglePlace,
  source: string,
  target: string,
) => {
  const reviews = place.reviews as unknown as {
    rating: number
    originalText?: { text: string }
  }[]
  const sourceLanguage = languages.find((l) => l.code === source)
  if (!sourceLanguage) {
    throw new Error('Source language not found')
  }

  const targetLanguage = languages.find((l) => l.code === target)
  if (!targetLanguage) {
    throw new Error('Target language not found')
  }

  const system = `Translate place's display and reviews from ${sourceLanguage.name} to ${targetLanguage.name}.`
  const prompt = `Place name and details:
 - displayName: ${place.displayName}
 - reviews:
   - ${reviews.map((review) => `rating: ${review.rating}, text: ${review.originalText?.text ?? ''}`).join('\n   - ')}
`

  const model = google('gemini-1.5-flash-latest')
  const result = await generateObject({
    model,
    maxRetries: 3,
    schema,
    system,
    prompt,
    mode: 'json',
  })

  console.log({
    system,
    prompt,
    original: JSON.stringify(
      { displayName: place.displayName, reviews: place.reviews },
      null,
      2,
    ),
    translated: JSON.stringify(result.object, null, 2),
  })

  return result.object
}

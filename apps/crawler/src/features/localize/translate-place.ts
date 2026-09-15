import { languages } from '@hyperlocal/consts'
import type { Place } from '@hyperlocal/db'
import { google } from '@ai-sdk/google'
import { generateText, Output } from 'ai'
import consola from 'consola'
import { z } from 'zod'

// 店舗×言語あたり1リクエストにまとめるためのスキーマ
const schema = z.object({
  displayName: z.string(),
  reviews: z.array(
    z.object({
      index: z.number(),
      text: z.string(),
    }),
  ),
})

// 将来のモデル切替用 (例: TRANSLATE_MODEL=gemini-3.5-flash-lite)
const MODEL = process.env.TRANSLATE_MODEL ?? 'gemini-2.5-flash-lite'

// ビルド時に翻訳するレビュー件数 (表示は先頭のみ使うため、残りは訳さない)
const REVIEW_LIMIT = Number(process.env.TRANSLATE_REVIEW_LIMIT ?? 2)

export const translatePlace = async (
  place: Place,
  from: string,
  to: string,
) => {
  // If source and target languages are the same, return the original object
  if (from === to) {
    return {
      originalDisplayName: place.displayName,
      displayName: place.displayName,
      reviews: place.reviews.map((review) => ({
        rating: review.rating,
        text: review.originalText?.text,
      })),
    }
  }

  const sourceLang = languages.find((l) => l.id === from)
  if (!sourceLang) {
    throw new Error('Source language not found')
  }

  const targetLang = languages.find((l) => l.id === to)
  if (!targetLang) {
    throw new Error('Target language not found')
  }

  const reviewInputs = place.reviews
    .map((review, index) => ({
      index,
      rating: review.rating,
      text: review.originalText?.text,
    }))
    .filter((r) => r.text)
    .slice(0, REVIEW_LIMIT)

  const prompt = [
    `Name: ${place.displayName}`,
    ...reviewInputs.map((r) => `Review ${r.index}: ${r.text}`),
  ].join('\n')

  try {
    const result = await generateText({
      model: google(MODEL),
      maxRetries: 3,
      output: Output.object({ schema }),
      system: `Translate the following ${sourceLang.displayName} restaurant name and customer reviews into ${targetLang.displayName}, item by item. Keep the original meaning and tone so they sound natural in ${targetLang.displayName}. Remove personal information, promotional content, and platform-specific remarks. Do not merge items and do not invent new ones.`,
      prompt,
    })

    const textsByIndex = new Map(
      result.output.reviews.map((r) => [r.index, r.text] as const),
    )

    return {
      displayName: result.output.displayName,
      originalDisplayName: place.displayName,
      reviews: place.reviews.map((review, index) => ({
        rating: review.rating,
        text: textsByIndex.get(index) || undefined,
      })),
    }
  } catch (error) {
    if (error instanceof Error) {
      consola.error(place.id, `${from}->${to}`, error.message)
    }
    return {
      displayName: place.displayName,
      originalDisplayName: place.displayName,
      reviews: place.reviews.map((review) => ({
        rating: review.rating,
        text: undefined,
      })),
    }
  }
}

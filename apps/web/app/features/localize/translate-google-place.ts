import languages from '~/consts/languages'
import type { GooglePlace } from '~/services/db'
import { translateSentences } from './translate-sentences'

export const translateGooglePlace = async (
  place: GooglePlace,
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

  const source = languages.find((l) => l.id === from)
  if (!source) {
    throw new Error('Source language not found')
  }

  const target = languages.find((l) => l.id === to)
  if (!target) {
    throw new Error('Target language not found')
  }

  let displayName = place.displayName
  try {
    displayName = await translateSentences({
      sentence: place.displayName,
      source: source.displayName,
      target: target.displayName,
    })
  } catch (error) {
    console.log(displayName, error)
  }

  const reviews: { rating: number; text?: string }[] = []
  for (const review of place.reviews) {
    const text = review.originalText?.text
    if (!text) {
      reviews.push({ rating: review.rating })
      continue
    }

    try {
      const translatedText = await translateSentences({
        sentence: text,
        source: source.displayName,
        target: target.displayName,
      })

      reviews.push({
        rating: review.rating,
        text: translatedText !== '' ? translatedText : undefined,
      })
    } catch (error) {
      console.log(text, error)
    }
  }

  return { displayName, originalDisplayName: place.displayName, reviews }
}

import { languages } from '@hyperlocal/consts'
import type { Place } from '@hyperlocal/db'
import { translateSentences } from './translate-sentences'

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

  let displayName = place.displayName
  try {
    displayName = await translateSentences({
      sentence: place.displayName,
      source: sourceLang.displayName,
      target: targetLang.displayName,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.log(place.id, 'displayName', error.message)
    }
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
        source: sourceLang.displayName,
        target: targetLang.displayName,
      })

      reviews.push({
        rating: review.rating,
        text: translatedText !== '' ? translatedText : undefined,
      })
    } catch (error) {
      if (error instanceof Error) {
        console.log(place.id, 'review', error.message)
      }
    }
  }

  return { displayName, originalDisplayName: place.displayName, reviews }
}

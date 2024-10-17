import type {
  GooglePlacePhoto,
  GooglePlacePriceLevel,
  GooglePlaceReview,
} from '@hyperlocal/types'
import type { Selectable } from 'kysely'
import type { DB } from './schema'

export type LocalizedPlace = Omit<
  Selectable<DB['localizedPlaces']>,
  'genres' | 'priceLevel' | 'photos' | 'reviews'
> & {
  genres: string[]
  priceLevel: GooglePlacePriceLevel | null
  photos: string[]
  reviews: Array<{ rating: number; text?: string }>
}

export type Place = Omit<
  Selectable<DB['places']>,
  'categories' | 'genres' | 'priceLevel' | 'photos' | 'reviews'
> & {
  categories: string[]
  genres: string[]
  priceLevel: GooglePlacePriceLevel | null
  photos: GooglePlacePhoto[]
  reviews: GooglePlaceReview[]
}

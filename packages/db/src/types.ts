import type {
  GooglePlacePhoto,
  GooglePlacePriceLevel,
  GooglePlaceReview,
  GooglePlaceType,
} from '@hyperlocal/types'
import type { Selectable } from 'kysely'
import type { DB } from './schema'

export type GooglePlace = Omit<
  Selectable<DB['googlePlaces']>,
  'types' | 'priceLevel' | 'photos' | 'reviews'
> & {
  types: GooglePlaceType[]
  priceLevel: GooglePlacePriceLevel | null
  photos: GooglePlacePhoto[]
  reviews: GooglePlaceReview[]
}

export type LocalizedPlace = Omit<
  Selectable<DB['localizedPlaces']>,
  'types' | 'priceLevel' | 'photos' | 'reviews'
> & {
  types: GooglePlaceType[]
  priceLevel: GooglePlacePriceLevel | null
  photos: string[]
  reviews: Array<{ rating: number; text?: string }>
}

export type Place = Omit<
  Selectable<DB['places']>,
  'priceLevel' | 'photos' | 'reviews'
> & {
  priceLevel: GooglePlacePriceLevel | null
  photos: GooglePlacePhoto[]
  reviews: GooglePlaceReview[]
}

import type { Selectable } from 'kysely'
import type {
  GooglePlacePhoto,
  GooglePlacePriceLevel,
  GooglePlaceReview,
  GooglePlaceType,
} from '../google-places'
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

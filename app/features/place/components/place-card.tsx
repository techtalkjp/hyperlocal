import { MessageSquareIcon } from 'lucide-react'
import { Badge, HStack } from '~/components/ui'
import { Rating } from '~/features/place/components/rating'
import type { GooglePlace } from '~/services/db'
import type {
  GooglePlacePhoto,
  GooglePlacePriceLevel,
  GooglePlaceReview,
  PlaceType,
} from '~/services/google-places'
import { mapPlaceTypes, priceLevelLabel } from '../utils'

interface PlaceCardProps extends React.ComponentProps<typeof HStack> {
  place: GooglePlace
  no: number
}
export const PlaceCard = ({ place, no }: PlaceCardProps) => {
  const types = place.types as unknown as PlaceType[]
  const priceLevel = place.priceLevel as GooglePlacePriceLevel
  const photos = place.photos as unknown as GooglePlacePhoto[]
  const reviews = place.reviews as unknown as GooglePlaceReview[]

  return (
    <HStack className="items-start gap-4" key={place.id}>
      <div className="grid h-32 w-32 flex-shrink-0 place-content-center place-items-center bg-muted text-muted-foreground">
        {photos.length > 0 && photos[0].name ? (
          <img
            className="h-32 w-32 rounded object-cover transition-transform hover:scale-125"
            src={`/resources/photos/${photos[0].name}.jpg`}
            loading="lazy"
            alt="photo1"
          />
        ) : (
          <div>No Photo</div>
        )}
      </div>

      <div className="flex-1 leading-relaxed">
        <div className="font-bold">
          <a href={place.googleMapsUri} target="_blank" rel="noreferrer">
            {no}. {place.displayName}
          </a>
        </div>
        <div className="text-xs text-foreground/70">{place.displayName}</div>

        <HStack className="my-0.5 flex-wrap gap-1">
          {mapPlaceTypes(types).map((type) => (
            <Badge
              key={type}
              variant="outline"
              className="bg-muted px-2 py-0.5 capitalize text-muted-foreground"
            >
              {type}
            </Badge>
          ))}
        </HStack>

        <HStack>
          <HStack className="flex-1">
            <Rating star={place.rating} withLabel={true} size={14} />
            <div className="text-xs text-muted-foreground">
              {place.userRatingCount} reviews
            </div>
          </HStack>
          {place.priceLevel && (
            <div className="flex-shrink-0 text-xs font-bold text-foreground/70">
              {priceLevelLabel(priceLevel)}
            </div>
          )}
        </HStack>

        {reviews.length > 0 &&
          reviews[0].originalText?.text &&
          reviews[0].originalText.text !== '' && (
            <HStack className="items-start">
              <MessageSquareIcon size="12" className="mt-0.5 flex-shrink-0" />
              <div className="line-clamp-2 text-xs text-muted-foreground">
                "{reviews[0].originalText.text}"
              </div>
            </HStack>
          )}
      </div>
    </HStack>
  )
}

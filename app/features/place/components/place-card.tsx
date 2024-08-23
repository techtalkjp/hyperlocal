import { MessageSquareIcon } from 'lucide-react'
import { Badge, HStack } from '~/components/ui'
import { Rating } from '~/features/place/components/rating'
import type { Place } from '~/services/google-places'
import { mapPlaceTypes, priceLevelLabel } from '../utils'

interface PlaceCardProps extends React.ComponentProps<typeof HStack> {
  place: Place
  no: number
}
export const PlaceCard = ({ place, no }: PlaceCardProps) => {
  return (
    <HStack className="items-start gap-4" key={place.id}>
      <div className="grid h-32 w-32 flex-shrink-0 place-content-center place-items-center bg-muted text-muted-foreground">
        {place.photos?.[0]?.name ? (
          <img
            className="h-32 w-32 rounded object-cover transition-transform hover:scale-125"
            src={`/resources/photos/${place.photos?.[0].name}.jpg`}
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
            {no}. {place.displayName.text}
          </a>
        </div>
        <div className="text-xs text-foreground/70">
          {place.displayName.text}
        </div>

        <HStack className="my-0.5 flex-wrap gap-1">
          {mapPlaceTypes(place.types).map((type) => (
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
              {priceLevelLabel(place.priceLevel)}
            </div>
          )}
        </HStack>

        {place.reviews?.[0]?.originalText?.text &&
          place.reviews[0].originalText.text !== '' && (
            <HStack className="items-start">
              <MessageSquareIcon size="12" className="mt-0.5 flex-shrink-0" />
              <div className="line-clamp-2 text-xs text-muted-foreground">
                "{place.reviews[0].originalText.text}"
              </div>
            </HStack>
          )}
      </div>
    </HStack>
  )
}

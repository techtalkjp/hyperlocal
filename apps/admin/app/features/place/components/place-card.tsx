import type { Place } from '@hyperlocal/db/src/types'
import { MessageSquareIcon } from 'lucide-react'
import { Badge, HStack } from '~/components/ui'
import { Rating } from '~/features/place/components/rating'
import { priceLevelLabel } from '../utils'

interface PlaceCardProps extends React.ComponentProps<typeof HStack> {
  place: Place
  no?: number
}
export const PlaceCard = ({ place, no }: PlaceCardProps) => {
  return (
    <HStack className="items-start gap-4" key={place.id}>
      <div className="bg-muted text-muted-foreground grid h-32 w-32 shrink-0 place-content-center place-items-center rounded">
        {place.photos.length > 0 ? (
          <img
            className="h-32 w-32 rounded object-cover"
            src={place.photos[0]}
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
            {no && `${no}.`} {place.displayName}
          </a>
        </div>
        <div className="text-foreground/70 text-xs">{place.displayName}</div>

        <HStack className="my-0.5 flex-wrap gap-1">
          {place.genres.map((genre) => (
            <Badge
              key={genre}
              variant="outline"
              className="bg-muted text-muted-foreground px-2 py-0.5 capitalize"
            >
              {genre}
            </Badge>
          ))}
        </HStack>

        <HStack>
          <HStack className="flex-1">
            <Rating star={place.rating} withLabel={true} size={14} />
            <div className="text-muted-foreground text-xs">
              {place.userRatingCount} reviews
            </div>
          </HStack>
          {place.priceLevel && (
            <div className="text-foreground/70 shrink-0 text-xs font-bold">
              {priceLevelLabel(place.priceLevel)}
            </div>
          )}
        </HStack>

        {place.reviews.length > 0 &&
          place.reviews[0].originalText?.text &&
          place.reviews[0].originalText.text !== '' && (
            <HStack className="items-start">
              <MessageSquareIcon size="12" className="mt-0.5 shrink-0" />
              <div className="text-muted-foreground line-clamp-2 text-xs">
                "{place.reviews[0].originalText.text}"
              </div>
            </HStack>
          )}
      </div>
    </HStack>
  )
}

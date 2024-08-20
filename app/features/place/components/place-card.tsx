import { MessageSquareIcon } from 'lucide-react'
import { HStack } from '~/components/ui'
import { Rating } from '~/features/place/components/rating'
import type { Place } from '~/services/google-places'

interface PlaceCardProps extends React.ComponentProps<typeof HStack> {
  place: Place
  no: number
}
export const PlaceCard = ({ place, no }: PlaceCardProps) => {
  return (
    <HStack className="items-start gap-4" key={place.id}>
      <div className="h-32 w-32 flex-shrink-0">
        <img
          className="h-32 w-32 rounded object-cover transition-transform hover:scale-125"
          src={`/resources/photos/${place.photos?.[0].name}.jpg`}
          loading="lazy"
          alt="photo1"
        />
      </div>
      <div className="leading-relaxed">
        <div className="font-bold">
          <a href={place.googleMapsUri} target="_blank" rel="noreferrer">
            {no}. {place.displayName.text}
          </a>
        </div>
        <div className="text-xs text-foreground/70">
          {place.displayName.text}
        </div>

        <HStack>
          <Rating star={place.rating} withLabel={true} size={14} />
          <div className="text-xs text-muted-foreground">
            {place.userRatingCount} reviews
          </div>
        </HStack>
        <HStack className="items-start">
          <MessageSquareIcon size="12" className="mt-0.5 flex-shrink-0" />
          <div className="line-clamp-2 text-xs text-muted-foreground">
            "{place.reviews?.[0]?.originalText?.text}"
          </div>
        </HStack>
      </div>
    </HStack>
  )
}

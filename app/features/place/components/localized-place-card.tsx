import { MessageSquareIcon } from 'lucide-react'
import { Badge, HStack } from '~/components/ui'
import { Rating } from '~/features/place/components/rating'
import dayjs from '~/libs/dayjs'
import { cn } from '~/libs/utils'
import type { LocalizedPlace } from '~/services/db'
import { BusinessStatusBadge } from '.'
import {
  type BusinessHours,
  getBusinessStatus,
  mapPlaceTypes,
  priceLevelLabel,
} from '../utils'

interface GooglePlaceCardProps extends React.ComponentProps<typeof HStack> {
  place: LocalizedPlace
  no?: number
  loading?: 'eager' | 'lazy'
}
export const LocalizedPlaceCard = ({
  place,
  no,
  loading = 'eager',
  className,
}: GooglePlaceCardProps) => {
  const date = dayjs().utc().toDate()
  const businessStatus = getBusinessStatus(
    place.regularOpeningHours as BusinessHours | null,
    date,
    'Asia/Tokyo',
  )

  return (
    <HStack className={cn('items-start gap-4', className)}>
      <div className="grid h-32 w-32 flex-shrink-0 place-content-center place-items-center rounded bg-muted text-muted-foreground">
        {place.photos.length > 0 ? (
          <img
            className="h-32 w-32 rounded object-cover"
            src={place.photos[0]}
            loading={loading}
            alt="photo1"
          />
        ) : (
          <div>No Photo</div>
        )}
      </div>

      <div className="flex-1 leading-relaxed">
        <div className="font-bold">
          {no && `${no}.`} {place.displayName}
        </div>
        <div className="text-xs text-foreground/70">
          {place.originalDisplayName}
        </div>

        <HStack className="flex-1">
          <Rating star={place.rating} withLabel size={14} />
          <div className="text-xs text-muted-foreground">
            (<span>{place.userRatingCount}</span> reviews)
          </div>
        </HStack>

        <HStack className="my-0.5 flex-wrap gap-1">
          {mapPlaceTypes(place.types).map((type) => (
            <Badge
              key={type}
              variant="outline"
              className="rounded border-none bg-muted px-1 py-0.5 font-semibold capitalize text-muted-foreground"
            >
              {type}
            </Badge>
          ))}
        </HStack>

        <HStack>
          <BusinessStatusBadge status={businessStatus} />

          <div className="flex-1" />

          {place.priceLevel && (
            <div className="flex-shrink-0 text-xs font-bold text-foreground/70">
              {priceLevelLabel(place.priceLevel)}
            </div>
          )}
        </HStack>

        {place.reviews[0]?.text && (
          <HStack className="items-start">
            <MessageSquareIcon size="12" className="mt-0.5 flex-shrink-0" />
            <div className="line-clamp-2 text-xs text-muted-foreground">
              "{place.reviews[0].text}"
            </div>
          </HStack>
        )}
      </div>
    </HStack>
  )
}

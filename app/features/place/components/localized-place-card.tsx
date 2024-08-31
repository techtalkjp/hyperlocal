import { MessageSquareIcon } from 'lucide-react'
import { ClientOnly } from 'remix-utils/client-only'
import { Badge, HStack } from '~/components/ui'
import cities from '~/consts/cities'
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
  withOriginalName?: boolean
}
export const LocalizedPlaceCard = ({
  place,
  no,
  loading = 'eager',
  withOriginalName = false,
  className,
}: GooglePlaceCardProps) => {
  const city = cities.find((c) => c.cityId === place.cityId)

  const date = dayjs().utc().toDate()
  const businessStatus = getBusinessStatus(
    place.regularOpeningHours as BusinessHours | null,
    date,
    city?.timezone ?? 'Asia/Tokyo',
  )

  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr] gap-2 text-card-foreground',
        className,
      )}
    >
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

      <div className="ml-2">
        <div className="font-semibold">
          {no && `${no}.`} {place.displayName}
        </div>

        {withOriginalName && (
          <div className="text-xs leading-none text-muted-foreground">
            {place.originalDisplayName}
          </div>
        )}

        <HStack>
          <Rating star={place.rating} withLabel size={16} />
          <div className="text-sm text-muted-foreground">
            ({place.userRatingCount} reviews)
          </div>
        </HStack>

        <HStack className="flex-wrap gap-1">
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
          <ClientOnly
            fallback={
              <span className="px-1 py-0.5 text-xs text-transparent">
                Status
              </span>
            }
          >
            {() => <BusinessStatusBadge status={businessStatus} />}
          </ClientOnly>

          <div className="flex-1" />

          {place.priceLevel && (
            <div className="flex-shrink-0 text-xs text-muted-foreground">
              {priceLevelLabel(place.priceLevel)}
            </div>
          )}
        </HStack>
      </div>

      <div className="col-span-2">
        {place.reviews[0]?.text && (
          <HStack className="items-start text-muted-foreground">
            <MessageSquareIcon size="12" className="mt-0.5 flex-shrink-0" />
            <div className="line-clamp-3 text-xs">
              "{place.reviews[0].text}"
            </div>
          </HStack>
        )}
      </div>
    </div>
  )
}

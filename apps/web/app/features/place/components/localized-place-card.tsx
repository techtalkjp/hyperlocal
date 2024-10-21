import { cities } from '@hyperlocal/consts'
import type { LocalizedPlace } from '@hyperlocal/db'
import { Link } from '@remix-run/react'
import { LinkIcon, MapIcon, MessageSquareIcon } from 'lucide-react'
import { ClientOnly } from 'remix-utils/client-only'
import { Badge, Button, HStack } from '~/components/ui'
import { Rating } from '~/features/place/components/rating'
import dayjs from '~/libs/dayjs'
import { cn } from '~/libs/utils'
import { BusinessStatusBadge } from '.'
import {
  buildTabelogLink,
  type BusinessHours,
  getBusinessStatus,
  priceLevelLabel,
} from '../utils'

interface PlaceCardProps extends React.ComponentProps<typeof HStack> {
  place: LocalizedPlace
  no?: number
  loading?: 'eager' | 'lazy'
  withOriginalName?: boolean
  to: string
}
export const LocalizedPlaceCard = ({
  place,
  no,
  loading = 'eager',
  withOriginalName = false,
  to,
  className,
}: PlaceCardProps) => {
  const city = cities.find((c) => c.cityId === place.cityId)
  const date = dayjs().utc().toDate()
  const businessStatusResult = getBusinessStatus(
    place.regularOpeningHours as BusinessHours | null,
    date,
    city?.timezone ?? 'Asia/Tokyo',
  )

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-y-4 rounded-md border p-2 text-sm text-card-foreground hover:bg-secondary/50 hover:shadow-md sm:text-base md:text-lg',
        className,
      )}
    >
      <div className="grid grid-cols-[auto_1fr] gap-4">
        <div className="h-32 w-32 flex-shrink-0 place-content-center place-items-center rounded bg-muted text-muted-foreground">
          <Link to={to}>
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
          </Link>
        </div>

        <div>
          <div className="text-base font-semibold sm:text-xl md:text-2xl">
            <Link to={to} className="hover:underline">
              {no && `${no}.`} {place.displayName}
            </Link>
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
            {place.genres.map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                className="rounded border-none bg-muted px-1 py-0.5 font-semibold capitalize text-muted-foreground"
              >
                {genre}
              </Badge>
            ))}
          </HStack>

          <HStack>
            <ClientOnly
              fallback={
                <span className="px-1 py-0.5 text-sm text-transparent">
                  Status
                </span>
              }
            >
              {() => (
                <BusinessStatusBadge statusResult={businessStatusResult} />
              )}
            </ClientOnly>

            <div className="flex-1" />

            {place.priceLevel && (
              <div className="flex-shrink-0 text-muted-foreground">
                {priceLevelLabel(place.priceLevel)}
              </div>
            )}
          </HStack>

          <HStack className="text-muted-foreground">
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={(e) => e.stopPropagation()}
              asChild
              className="cursor-pointer"
            >
              <a href={place.googleMapsUri} target="_blank" rel="noreferrer">
                <MapIcon size="14" className="mr-1 inline" />
                Google Maps
              </a>
            </Button>

            {place.sourceUri && (
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={(e) => e.stopPropagation()}
                asChild
                className="cursor-pointer"
              >
                <a
                  href={buildTabelogLink(place.sourceUri, place.language)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LinkIcon size="14" className="mr-1 inline" />
                  Tabelog
                </a>
              </Button>
            )}
          </HStack>
        </div>
      </div>

      <div className="relative">
        {place.reviews[0]?.text && (
          <HStack className="items-start text-muted-foreground">
            <MessageSquareIcon className="mt-0.5 h-3 w-3 flex-shrink-0 sm:mt-1 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            <div className="line-clamp-3">"{place.reviews[0].text}"</div>
          </HStack>
        )}

        <Link
          className="absolute bottom-0 right-0 bg-card px-2 hover:text-primary-foreground"
          to={to}
        >
          Read more...
        </Link>
      </div>
    </div>
  )
}

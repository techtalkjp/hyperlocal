import type { LocalizedPlace } from '@hyperlocal/db'
import { ExternalLink, MapIcon, MapPinIcon } from 'lucide-react'
import type React from 'react'
import { Button, HStack } from '~/components/ui'
import { cn } from '~/libs/utils'
import { buildTabelogLink } from '../../utils'

interface ActionButtonsProps extends React.ComponentProps<'div'> {
  place: LocalizedPlace
  distance?: number
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  place,
  distance,
  className,
}) => (
  <HStack className={cn('pointer-events-none flex gap-2', className)}>
    {distance && (
      <div className="whitespace-nowrap text-xs text-muted-foreground md:text-sm">
        <MapPinIcon className="mb-1 mr-1 inline h-4 w-4" />
        {distance > 1000
          ? `${(distance / 1000).toFixed(1)} km`
          : `${distance.toFixed(0)} m`}
      </div>
    )}

    <Button type="button" variant="outline" size="xs" asChild>
      <a
        href={place.googleMapsUri}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto"
      >
        <MapIcon size="14" className="mr-1" />
        Google Maps
      </a>
    </Button>

    {place.sourceUri && (
      <Button type="button" variant="outline" size="xs" asChild>
        <a
          href={buildTabelogLink(place.sourceUri, place.language)}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto"
        >
          <ExternalLink size="14" className="mr-1" />
          Tabelog
        </a>
      </Button>
    )}
  </HStack>
)

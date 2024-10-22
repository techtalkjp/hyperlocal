import type { LocalizedPlace } from '@hyperlocal/db'
import { LinkIcon, MapIcon } from 'lucide-react'
import React from 'react'
import { Button, HStack } from '~/components/ui'
import { cn } from '~/libs/utils'
import { buildTabelogLink } from '../../utils'

interface ActionButtonsProps extends React.ComponentProps<'div'> {
  place: LocalizedPlace
}

export const ActionButtons: React.FC<ActionButtonsProps> = React.memo(
  ({ place, className }) => (
    <HStack className={cn('pointer-events-none', className)}>
      <Button type="button" variant="default" size="xs" asChild>
        <a href={place.googleMapsUri} target="_blank" rel="noopener noreferrer">
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
          >
            <LinkIcon size="14" className="mr-1" />
            Tabelog
          </a>
        </Button>
      )}
    </HStack>
  ),
)

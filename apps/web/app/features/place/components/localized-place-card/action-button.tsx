import type { LocalizedPlace } from '@hyperlocal/db'
import { LinkIcon, MapIcon } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui'
import { cn } from '~/libs/utils'
import { buildTabelogLink } from '../../utils'

interface ActionButtonsProps extends React.ComponentProps<'div'> {
  place: LocalizedPlace
}

export const ActionButtons: React.FC<ActionButtonsProps> = React.memo(
  ({ place, className }) => (
    <div className={cn('pointer-events-none flex gap-2', className)}>
      <Button type="button" variant="default" size="sm" asChild>
        <a
          href={place.googleMapsUri}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto inline-flex items-center rounded border border-muted px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <MapIcon size="14" className="mr-1" />
          Google Maps
        </a>
      </Button>

      {place.sourceUri && (
        <Button type="button" variant="outline" size="sm" asChild>
          <a
            href={buildTabelogLink(place.sourceUri, place.language)}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center rounded border border-muted px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <LinkIcon size="14" className="mr-1" />
            Tabelog
          </a>
        </Button>
      )}
    </div>
  ),
)

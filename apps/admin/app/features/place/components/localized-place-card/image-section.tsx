import type { LocalizedPlace } from '@hyperlocal/db/src/types'
import React from 'react'

interface ImageSectionProps {
  place: LocalizedPlace
  loading: 'eager' | 'lazy'
}

export const ImageSection: React.FC<ImageSectionProps> = React.memo(
  ({ place, loading }) => (
    <div className="bg-muted text-muted-foreground h-36 w-36 shrink-0 place-content-center place-items-center sm:h-48 sm:w-48 md:h-64 md:w-64">
      {place.photos.length > 0 ? (
        <img
          width={400}
          src={place.photos[0]}
          loading={loading}
          alt={place.displayName}
          className="h-36 w-36 rounded-tl object-cover sm:h-48 sm:w-48 md:h-64 md:w-64"
          style={{ viewTransitionName: `hero-${place.placeId}` }}
        />
      ) : (
        <div>No Photo</div>
      )}
    </div>
  ),
)

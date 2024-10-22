import type { LocalizedPlace } from '@hyperlocal/db/src'
import React from 'react'

interface ImageSectionProps {
  place: LocalizedPlace
  loading: 'eager' | 'lazy'
}

export const ImageSection: React.FC<ImageSectionProps> = React.memo(
  ({ place, loading }) => (
    <div className="h-32 w-32 flex-shrink-0 place-content-center place-items-center rounded bg-muted text-muted-foreground">
      {place.photos.length > 0 ? (
        <img
          className="h-32 w-32 rounded object-cover"
          src={place.photos[0]}
          loading={loading}
          alt={place.displayName}
        />
      ) : (
        <div>No Photo</div>
      )}
    </div>
  ),
)

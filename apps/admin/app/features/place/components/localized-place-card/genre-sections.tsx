import React from 'react'
import { Badge, HStack } from '~/components/ui'

interface GenresSectionProps {
  genres: string[]
}

export const GenresSection: React.FC<GenresSectionProps> = React.memo(
  ({ genres }) => (
    <HStack className="flex flex-wrap gap-x-2 gap-y-0.5">
      {genres.map((genre) => (
        <Badge
          key={genre}
          variant="outline"
          className="rounded border-none bg-muted px-1 py-1 font-semibold capitalize text-muted-foreground"
        >
          {genre}
        </Badge>
      ))}
    </HStack>
  ),
)

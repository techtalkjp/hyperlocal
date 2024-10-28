import { areas } from '@hyperlocal/consts'
import { Link, useFetcher, type ClientLoaderFunction } from '@remix-run/react'
import { FootprintsIcon, MapPinIcon } from 'lucide-react'
import React from 'react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  HStack,
} from '~/components/ui'
import { sortAreasByDistance } from '~/services/distance.client'

export const clientLoader = async (args: ClientLoaderFunction) => {
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  }).catch((e) => {
    console.log(e)
    return null
  })
  if (!position) {
    throw new Error('Geolocation not available')
  }

  const nearbyAreas = sortAreasByDistance(
    areas,
    position.coords.latitude,
    position.coords.longitude,
  ).slice(0, 5)
  return { nearbyAreas }
}

export const NearbyAreasSelector = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const fetcher = useFetcher<typeof clientLoader>()

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      fetcher.load('/resources/nearby-areas')
    }
  }

  const handleClickLink = (e: React.MouseEvent) => {
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="default">
          <MapPinIcon className="mr-2 h-4 w-4" />
          Nearby Areas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {fetcher.state === 'loading' && (
          <DropdownMenuItem>
            <div>Loading...</div>
          </DropdownMenuItem>
        )}
        <DropdownMenuGroup>
          {fetcher.data?.nearbyAreas.map((area) => (
            <DropdownMenuItem key={area.areaId}>
              <Link to={`/area/${area.areaId}`} onClick={handleClickLink}>
                <div>{area.i18n.en}</div>
                {area.distance && (
                  <HStack className="text-xs font-semibold text-blue-500">
                    {/* 距離 */}
                    <div className="whitespace-nowrap">
                      <MapPinIcon className="mb-1 mr-1 inline h-4 w-4" />
                      {area.distance > 1000
                        ? `${(area.distance / 1000).toFixed(1)} km`
                        : `${area.distance.toFixed(0)} m`}
                    </div>

                    {/* 徒歩何分か。10キロ未満のときだけ表示 */}
                    <div className="whitespace-nowrap">
                      <FootprintsIcon className="mb-1 mr-1 inline h-4 w-4" />
                      <span>
                        {area.distance > 10000
                          ? ''
                          : `${(area.distance / 80).toFixed(0)} min`}
                      </span>
                    </div>
                  </HStack>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/areas" onClick={handleClickLink}>
            <div>See all areas</div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

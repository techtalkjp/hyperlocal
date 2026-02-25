import {
  areas,
  languages,
  type i18nRecord,
  type LanguageId,
} from '@hyperlocal/consts'
import { FootprintsIcon, LoaderIcon, MapPinIcon } from 'lucide-react'
import React from 'react'
import { href, Link, useFetcher } from 'react-router'
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
import { sortAreasByDistance } from '~/services/distance'

const ButtonLabels: i18nRecord = {
  en: 'Nearby Areas',
  ja: '近くのエリア',
  ko: '근처 지역',
  'zh-cn': '附近地区',
  'zh-tw': '附近地區',
}

export const clientLoader = async () => {
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  }).catch((e) => {
    console.log(e)
    return null
  })
  if (!position) {
    return { nearbyAreas: [], error: 'Failed to get your location' }
  }

  const nearbyAreas = sortAreasByDistance(
    areas,
    position.coords.latitude,
    position.coords.longitude,
  ).slice(0, 5)
  return { nearbyAreas, error: null }
}

export const NearbyAreasSelector = ({
  languageId,
}: {
  languageId: LanguageId
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const fetcher = useFetcher<typeof clientLoader>()

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      fetcher.load('/resources/nearby-areas')
    }
  }

  const handleClickLink = () => {
    setIsOpen(false)
  }

  const lang = languages.find((l) => l.id === languageId)

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="rounded-full"
        >
          <MapPinIcon className="mr-2 h-4 w-4" />
          {ButtonLabels[languageId]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {fetcher.state === 'loading' && (
          <DropdownMenuItem className="text-blue-500">
            <LoaderIcon className="mr-2 inline h-4 w-4 animate-spin text-blue-500" />
            Loading...
          </DropdownMenuItem>
        )}
        {fetcher.data?.error && (
          <DropdownMenuItem className="text-red-500">
            <div>{fetcher.data.error}</div>
          </DropdownMenuItem>
        )}
        <DropdownMenuGroup>
          {fetcher.data?.nearbyAreas.map((area) => (
            <DropdownMenuItem
              key={area.areaId}
              className="block cursor-pointer"
              asChild
            >
              <Link
                to={`${lang?.path}area/${area.areaId}`}
                onClick={handleClickLink}
              >
                <div>{area.i18n[languageId]}</div>
                {area.distance && (
                  <HStack className="text-xs text-blue-500">
                    {/* 距離 */}
                    <div className="whitespace-nowrap">
                      <MapPinIcon className="mr-1 mb-1 inline h-4 w-4" />
                      {area.distance > 1000
                        ? `${(area.distance / 1000).toFixed(1)} km`
                        : `${area.distance.toFixed(0)} m`}
                    </div>

                    {/* 徒歩何分か。2キロ未満のときだけ表示 */}
                    {area.distance < 3000 && (
                      <div className="whitespace-nowrap">
                        <FootprintsIcon className="mr-1 mb-1 inline h-4 w-4" />
                        <span>{(area.distance / 80).toFixed(0)} min</span>
                      </div>
                    )}
                  </HStack>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link to={href('/')} onClick={handleClickLink}>
            See all areas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

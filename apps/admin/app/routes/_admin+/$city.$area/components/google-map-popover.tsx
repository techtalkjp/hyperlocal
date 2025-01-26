import { MapIcon } from 'lucide-react'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui'

interface GoogleMapPopoverProps
  extends React.ComponentPropsWithoutRef<typeof PopoverTrigger> {
  area: {
    latitude: number
    longitude: number
    radius: number
  }
  googleMapsApiKey: string
}
export const GoogleMapPopover = ({
  children,
  className,
  area,
  googleMapsApiKey,
}: GoogleMapPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="xs">
          <MapIcon size="12" className="mr-1 inline" />
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <img
          width="320"
          height="320"
          loading="lazy"
          src={`https://maps.googleapis.com/maps/api/staticmap?center=${area.latitude},${area.longitude}&zoom=17&size=320x320&markers=color:red%7Clabel:A%7C${area.latitude},${area.longitude}&key=${googleMapsApiKey}`}
          alt="map"
        />

        <div className="text-center">
          <a
            className="text-muted-foreground hover:text-foreground text-xs hover:underline"
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps/@${area.latitude},${area.longitude},16z`}
          >
            Show in Google Maps
          </a>
        </div>
      </PopoverContent>
    </Popover>
  )
}

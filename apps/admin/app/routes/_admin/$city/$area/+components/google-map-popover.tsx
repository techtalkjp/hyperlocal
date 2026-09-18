import { MapIcon } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "~/components/ui";

interface GoogleMapPopoverProps extends React.ComponentPropsWithoutRef<typeof PopoverTrigger> {
  area: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}
export const GoogleMapPopover = ({ children, area }: GoogleMapPopoverProps) => {
  // OSM埋め込み (キー不要・課金なし)。旧Static Maps (従量課金) の代替。
  const d = 0.004;
  const bbox = `${area.longitude - d},${area.latitude - d},${area.longitude + d},${area.latitude + d}`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="xs">
          <MapIcon size="12" className="mr-1 inline" />
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <iframe
          width="320"
          height="320"
          loading="lazy"
          title="map"
          sandbox="allow-scripts"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${area.latitude},${area.longitude}`}
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
  );
};

import { areas, languages, type i18nRecord, type LanguageId } from "@hyperlocal/consts";
import { LoaderIcon, MapPinIcon } from "lucide-react";
import React from "react";
import { href, Link, useFetcher } from "react-router";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui";
import { DistanceLabel } from "~/features/place/components/distance-label";
import { sortAreasByDistance } from "~/services/distance";

const ButtonLabels: i18nRecord = {
  en: "Nearby Areas",
  ja: "近くのエリア",
  ko: "근처 지역",
  "zh-cn": "附近地区",
  "zh-tw": "附近地區",
};

export const clientLoader = async () => {
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  }).catch((e) => {
    console.log(e);
    return null;
  });
  if (!position) {
    return { nearbyAreas: [], error: "Failed to get your location" };
  }

  const nearbyAreas = sortAreasByDistance(
    areas,
    position.coords.latitude,
    position.coords.longitude,
  ).slice(0, 5);
  return { nearbyAreas, error: null };
};

export const NearbyAreasSelector = ({ languageId }: { languageId: LanguageId }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const fetcher = useFetcher<typeof clientLoader>();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      void fetcher.load("/resources/nearby-areas");
    }
  };

  const handleClickLink = () => {
    setIsOpen(false);
  };

  const lang = languages.find((l) => l.id === languageId);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="default" size="sm">
          <MapPinIcon className="mr-2 h-4 w-4" />
          {ButtonLabels[languageId]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {fetcher.state === "loading" && (
          <div className="text-brand flex items-center gap-2 px-2 py-1.5 text-sm">
            <LoaderIcon className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}
        {fetcher.data?.error && (
          <div className="text-destructive px-2 py-1.5 text-sm">{fetcher.data.error}</div>
        )}
        <DropdownMenuGroup>
          {fetcher.data?.nearbyAreas.map((area) => (
            <DropdownMenuItem key={area.areaId} className="block cursor-pointer" asChild>
              <Link to={`${lang?.path}area/${area.areaId}`} onClick={handleClickLink}>
                <div>{area.i18n[languageId]}</div>
                {area.distance && <DistanceLabel distance={area.distance} />}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link to={href("/")} onClick={handleClickLink}>
            See all areas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

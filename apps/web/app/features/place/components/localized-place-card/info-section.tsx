import type { LocalizedPlace } from "@hyperlocal/db";
import type React from "react";
import { Stack } from "~/components/ui";
import type { getBusinessStatus } from "@hyperlocal/google-place-api";
import { StationLabel } from "../station-label";
import { GenresSection } from "./genre-sections";
import { RatingSection } from "./rating-sections";
import { StatusPriceSection } from "./status-price-section";

interface InfoSectionProps {
  place: LocalizedPlace;
  no?: number;
  businessStatusResult: ReturnType<typeof getBusinessStatus>;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ place, no, businessStatusResult }) => (
  <Stack className="gap-0.5 overflow-hidden">
    <div
      className="text-base leading-none font-semibold sm:text-xl md:text-2xl"
      style={{ viewTransitionName: `displayName-${place.placeId}` }}
    >
      {no && <span className="text-brand">{no}.</span>} {place.displayName}
    </div>

    <RatingSection place={place} />

    <GenresSection genres={place.genres} />

    <StationLabel station={place.nearestStation} distance={place.stationDistance} />

    <StatusPriceSection
      businessStatusResult={businessStatusResult}
      priceLevel={place.priceLevel ?? undefined}
    />
  </Stack>
);

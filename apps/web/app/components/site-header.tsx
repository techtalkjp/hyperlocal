import type { City, LanguageId } from "@hyperlocal/consts";
import { HStack } from "~/components/ui";
import { AreaTitle } from "./area-title";
import { LanguageSelect } from "./language-select";
import { NearbyAreasSelector } from "~/routes/resources/nearby-areas";

export const SiteHeader = ({ city, languageId }: { city: City; languageId: LanguageId }) => {
  return (
    <header className="flex items-center border-b px-2 py-2 sm:px-4 md:px-6">
      <AreaTitle city={city} languageId={languageId} />
      <div className="flex-1" />
      <HStack>
        <LanguageSelect currentLanguageId={languageId} />
        <NearbyAreasSelector languageId={languageId} />
      </HStack>
    </header>
  );
};

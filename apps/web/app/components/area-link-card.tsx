import type { Area, LanguageId } from "@hyperlocal/consts";
import { Link } from "react-router";
import { Badge } from "~/components/ui";

/**
 * エリアへのリンクカード（エリア一覧・カテゴリ親で共用）
 */
export const AreaLinkCard = ({
  to,
  area,
  languageId,
}: {
  to: string;
  area: Area;
  languageId: LanguageId;
}) => {
  return (
    <Link to={to} prefetch="viewport" viewTransition>
      <div className="hover:bg-secondary flex rounded-md border p-2 transition-colors">
        <div className="flex-1">
          <div
            className="font-semibold"
            style={{ viewTransitionName: `area-title-${area.areaId}` }}
          >
            {area.i18n[languageId]}
          </div>
          <div
            className="text-muted-foreground text-xs"
            style={{ viewTransitionName: `area-description-${area.areaId}` }}
          >
            {area.description[languageId]}
          </div>
        </div>
        <div>
          <Badge variant="secondary">Area</Badge>
        </div>
      </div>
    </Link>
  );
};

import { categories, cities, type LanguageId } from "@hyperlocal/consts";
import { LoaderIcon, MapPinIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { href, useFetcher } from "react-router";
import { Button, Skeleton, Stack } from "~/components/ui";
import { LocalizedPlaceCard } from "~/features/place/components/localized-place-card";
import type { loader as nearbyOpenLoader } from "~/routes/resources/nearby-open";
import { cn } from "~/libs/utils";
import { defaultCategoryForNow } from "./default-category";
import { nearbyLabels } from "./labels";

type Position = { lat: number; lng: number };

/**
 * トップの現在地セクション。位置を取り、近くで今開いている店をカテゴリ別に出す。
 * 位置が取れない・対応エリア外のときは一行で状況を伝えて、下のエリア一覧に任せる。
 */
export const NearbyOpenSection = ({
  languageId,
  cityId,
}: {
  languageId: LanguageId;
  cityId: string;
}) => {
  const city = cities.find((c) => c.cityId === cityId);
  const timeZone = city?.timezone ?? "Asia/Tokyo";
  const [position, setPosition] = useState<Position | null>(null);
  const [geoError, setGeoError] = useState(false);
  const [categoryId, setCategoryId] = useState(() => defaultCategoryForNow(new Date(), timeZone));
  const [openOnly, setOpenOnly] = useState(true);
  const fetcher = useFetcher<typeof nearbyOpenLoader>();

  // 外部同期: ブラウザの Geolocation API から現在地を1回取る (5分キャッシュ、10秒でタイムアウト)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setGeoError(true),
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false },
    );
  }, []);

  // 外部同期: 位置・カテゴリ・営業中フィルタが決まるたびにサーバへ問い合わせる
  useEffect(() => {
    if (!position) return;
    const params = new URLSearchParams({
      lat: String(position.lat),
      lng: String(position.lng),
      lang: languageId,
      category: categoryId,
      open: openOnly ? "1" : "0",
    });
    void fetcher.load(`/resources/nearby-open?${params}`);
    // fetcher は毎レンダーで参照が変わるため依存に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, categoryId, openOnly, languageId]);

  const data = fetcher.data && "places" in fetcher.data ? fetcher.data : null;
  const loading = !geoError && (!position || fetcher.state !== "idle" || (!data && !geoError));

  return (
    <Stack className="gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-heading flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-xl">
          <MapPinIcon className="text-brand h-5 w-5" />
          {nearbyLabels.title[languageId]}
        </h2>
        <div className="flex-1" />
        <Button
          type="button"
          size="sm"
          variant={openOnly ? "default" : "outline"}
          onClick={() => setOpenOnly((v) => !v)}
          aria-pressed={openOnly}
        >
          {nearbyLabels.openOnly[languageId]}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map((c) => (
          <Button
            key={c.id}
            type="button"
            size="sm"
            variant={c.id === categoryId ? "secondary" : "ghost"}
            onClick={() => setCategoryId(c.id)}
            aria-pressed={c.id === categoryId}
          >
            {c.i18n[languageId]}
          </Button>
        ))}
      </div>

      {geoError && (
        <p className="text-muted-foreground text-sm">{nearbyLabels.noLocation[languageId]}</p>
      )}

      {!geoError && !position && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <LoaderIcon className="text-brand h-4 w-4 animate-spin" />
          {nearbyLabels.locating[languageId]}
        </p>
      )}

      {data?.outOfCoverage && (
        <p className="text-muted-foreground text-sm">{nearbyLabels.outOfCoverage[languageId]}</p>
      )}

      {position && !data && !geoError && (
        <Stack className="gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full sm:h-48" />
          ))}
        </Stack>
      )}

      {data && !data.outOfCoverage && data.places.length === 0 && (
        <p className="text-muted-foreground text-sm">{nearbyLabels.empty[languageId]}</p>
      )}

      {data && data.places.length > 0 && (
        <div className={cn("flex flex-col gap-2", loading && "opacity-70")}>
          {data.places.map((place) => (
            <LocalizedPlaceCard
              key={place.placeId}
              place={place}
              distance={place.distance}
              loading="lazy"
              to={`${href("/:lang?/place/:place", {
                lang: languageId !== "en" ? languageId : undefined,
                place: place.placeId,
              })}?area=${place.areaId}&category=${place.categoryId}&rank=rating`}
            />
          ))}
        </div>
      )}
    </Stack>
  );
};

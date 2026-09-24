import { UTCDate } from "@date-fns/utc";
import { areas, categories, cities, languages } from "@hyperlocal/consts";
import type { LocalizedPlace } from "@hyperlocal/db";
import {
  BusinessStatus,
  type BusinessHours,
  getBusinessStatus,
} from "@hyperlocal/google-place-api";
import { listLocalizedPlaces } from "../_public.($lang)/area/$area/$category/$rank/+queries.server";
import { readShard } from "~/features/shards/reader";
import { calculateDistance, sortAreasByDistance } from "~/services/distance";
import type { Route } from "./+types/nearby-open";

// 現在地の周辺で「いま開いている店」を返す。トップの現在地セクション用。
// 近い順に最大3エリア (2.5km以内) の rating 一覧 shard を束ね、距離順に並べる。
// 位置情報で個別化される応答なのでキャッシュしない。

export const MAX_AREAS = 3;
export const MAX_AREA_DISTANCE_M = 2500;
const LIMIT = 30;

export interface NearbyOpenPlace extends LocalizedPlace {
  distance: number;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const langId = url.searchParams.get("lang") ?? "en";
  const categoryId = url.searchParams.get("category") ?? "lunch";
  const openOnly = url.searchParams.get("open") !== "0";

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !lat || !lng) {
    return Response.json({ error: "invalid position" }, { status: 400 });
  }
  const lang = languages.find((l) => l.id === langId) ?? languages[0];
  const category = categories.find((c) => c.id === categoryId) ?? categories[0];

  const nearbyAreas = sortAreasByDistance([...areas], lat, lng)
    .filter((a) => a.distance <= MAX_AREA_DISTANCE_M)
    .slice(0, MAX_AREAS);
  if (nearbyAreas.length === 0) {
    return { places: [] as NearbyOpenPlace[], areas: [], category, outOfCoverage: true };
  }

  const lists = await Promise.all(
    nearbyAreas.map(
      async (area) =>
        ((await readShard(
          `listing/${lang.id}/${area.areaId}/${category.id}/rating.json`,
        )) as unknown as LocalizedPlace[] | null) ??
        (await listLocalizedPlaces({
          cityId: area.cityId,
          areaId: area.areaId,
          categoryId: category.id,
          language: lang.id,
          rankingType: "rating",
        }).catch(() => [])),
    ),
  );

  const city = cities.find((c) => c.cityId === nearbyAreas[0]?.cityId);
  const now = new UTCDate();
  const seen = new Set<string>();
  const places: NearbyOpenPlace[] = [];
  for (const list of lists) {
    for (const place of list) {
      if (seen.has(place.placeId)) continue;
      seen.add(place.placeId);
      if (openOnly) {
        const { status } = getBusinessStatus(
          place.regularOpeningHours as BusinessHours | null,
          now,
          city?.timezone ?? "Asia/Tokyo",
        );
        if (
          status !== BusinessStatus.OPEN &&
          status !== BusinessStatus.OPEN_CLOSING_SOON &&
          status !== BusinessStatus.OPEN_24_HOURS
        )
          continue;
      }
      places.push({
        ...place,
        distance: calculateDistance(lat, lng, place.latitude, place.longitude),
      });
    }
  }
  places.sort((a, b) => a.distance - b.distance);

  return {
    places: places.slice(0, LIMIT),
    areas: nearbyAreas.map((a) => ({ areaId: a.areaId, distance: Math.round(a.distance) })),
    category,
    outOfCoverage: false,
  };
};

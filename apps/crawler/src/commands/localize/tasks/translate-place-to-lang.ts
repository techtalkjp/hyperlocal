import { areas, belongsToArea } from "@hyperlocal/consts";
import { db, type Place } from "@hyperlocal/db";
import consola from "consola";
import { upsertLocalizedPlaces } from "~/features/localize/mutations.server";
import { sourceHashOf } from "~/features/localize/source-hash";
import { translatePlace } from "~/features/localize/translate-place";
import { parseNearestStation } from "~/features/tabelog/parse-nearest-station";
import { db as duckdb } from "~/services/duckdb.server";

export const translatePlaceToLangTask = async ({
  placeId,
  from,
  to,
}: {
  placeId: string;
  from: string;
  to: string;
}) => {
  const place = await db
    .selectFrom("places")
    .selectAll()
    .where("id", "==", placeId)
    .executeTakeFirstOrThrow();

  const areaById = new Map<string, (typeof areas)[number]>(areas.map((a) => [a.areaId, a]));
  const crawled = await duckdb
    .selectFrom("crawled_restaurants")
    .select("features")
    .where("url", "==", place.sourceUri)
    .executeTakeFirst();
  const station = parseNearestStation(
    (crawled?.features as unknown as Record<string, string> | undefined)?.["交通手段"],
  )?.station;
  const ranked = (
    await duckdb
      .selectFrom("ranked_restaurants")
      .selectAll()
      .where("url", "==", place.sourceUri)
      .execute()
  ).filter((rk) => {
    // エリアに属さない掲載キーは作らない (ingest と同じ基準: 最寄駅、無ければ範囲)
    const area = areaById.get(rk.area);
    return area ? belongsToArea(area, station, place.latitude, place.longitude) : false;
  });

  if (ranked.length === 0) {
    consola.error("no area found for place", placeId);
    return;
  }

  const sourceHash = sourceHashOf(place as unknown as Place);

  // 全ての掲載キー (city/area/category/ranking) が同ハッシュ済みならスキップ
  const expectedKeys = ranked.flatMap((areaCategory) => {
    const area = areaById.get(areaCategory.area);
    if (!area) {
      return [];
    }
    return [`${area.cityId}/${area.areaId}/${areaCategory.category}/${areaCategory.ranking_type}`];
  });
  if (expectedKeys.length > 0) {
    const existing = await db
      .selectFrom("localizedPlaces")
      .select(["cityId", "areaId", "categoryId", "rankingType", "sourceHash"])
      .where("placeId", "==", placeId)
      .where("language", "==", to)
      .execute();
    const doneKeys = new Set(
      existing
        .filter((row) => row.sourceHash === sourceHash)
        .map((row) => `${row.cityId}/${row.areaId}/${row.categoryId}/${row.rankingType}`),
    );
    if (expectedKeys.every((key) => doneKeys.has(key))) {
      // 原文不変でも評価・件数・写真・営業時間・価格帯は追随 (APIなしの安価UPDATE)
      const current = await db
        .selectFrom("places")
        .select(["rating", "userRatingCount", "photos", "regularOpeningHours", "priceLevel"])
        .where("id", "==", placeId)
        .executeTakeFirstOrThrow();
      await db
        .updateTable("localizedPlaces")
        .set({
          rating: current.rating,
          userRatingCount: current.userRatingCount,
          photos: JSON.stringify(current.photos),
          regularOpeningHours: current.regularOpeningHours
            ? JSON.stringify(current.regularOpeningHours)
            : null,
          priceLevel: current.priceLevel,
        })
        .where("placeId", "==", placeId)
        .where("language", "==", to)
        .where("sourceHash", "==", sourceHash)
        .execute();
      consola.info(`skip (unchanged) ${placeId} -> ${to}`);
      return;
    }
  }

  // 翻訳
  const translated = await translatePlace(place as unknown as Place, from, to);

  // localized place 保存 (全掲載キー分を1文でupsert)
  const rows: {
    cityId: string;
    areaId: string;
    categoryId: string;
    languageId: string;
    rankingType: string;
    place: Place;
    translated: Awaited<ReturnType<typeof translatePlace>>;
    sourceHash: string;
  }[] = [];
  for (const areaCategory of ranked) {
    const area = areaById.get(areaCategory.area);
    if (!area) {
      consola.error("no area found for areaId", areaCategory.area);
      continue;
    }
    rows.push({
      cityId: area.cityId,
      areaId: area.areaId,
      categoryId: areaCategory.category,
      languageId: to,
      rankingType: areaCategory.ranking_type,
      place: place as unknown as Place,
      translated,
      sourceHash,
    });
  }

  await upsertLocalizedPlaces(rows);
};

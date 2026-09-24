import { areas, belongsToArea } from "@hyperlocal/consts";
import { db, extractStation, googleMapsSearchUrl, selfIdFromSourceUri } from "@hyperlocal/db";
import { defineCommand } from "citty";
import consola from "consola";
import { upsertPlace } from "../mutations";
import { parseNearestStation } from "~/features/tabelog/parse-nearest-station";
import { parseTabelogOpeningHours } from "~/features/tabelog/parse-opening-hours";
import { geocodeBlock } from "~/services/gsi";
import { db as duckdb } from "~/services/duckdb.server";

export default defineCommand({
  meta: {
    name: "ingest-tabelog",
    description:
      "Tabelog直結でstagingに取込 (Google不使用。新規追加＋評価更新。reviews/photos/hours/cidは既存温存)",
  },
  args: {
    limit: {
      type: "string",
      description: "処理する件数 (省略時は全件)",
      default: undefined,
    },
    url: {
      type: "string",
      description: "対象URL部分一致 (1店舗試運転用)",
      default: undefined,
    },
  },
  run: async ({ args }) => {
    await ingestTabelog({
      limit: args.limit ? Number.parseInt(args.limit, 10) : undefined,
      url: args.url,
    });
  },
});

// 予算表記 (～￥999 / ￥1,000～￥1,999 / -) -> PRICE_LEVEL_*
const priceLevelOf = (budgets: string[]): string | null => {
  const nums = budgets.flatMap((b) =>
    [...b.matchAll(/￥([0-9,]+)/g)].map((m) => Number(m[1].replaceAll(",", ""))),
  );
  if (nums.length === 0) return null;
  const max = Math.max(...nums);
  if (max < 2000) return "PRICE_LEVEL_INEXPENSIVE";
  if (max < 5000) return "PRICE_LEVEL_MODERATE";
  if (max < 10000) return "PRICE_LEVEL_EXPENSIVE";
  return "PRICE_LEVEL_VERY_EXPENSIVE";
};

// ParseJSONResultsPlugin済みのobject/arrayをTEXT列に戻す
const asText = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  return typeof v === "string" ? v : JSON.stringify(v);
};

interface IngestTabelogOptions {
  limit?: number;
  url?: string;
}
export const ingestTabelog = async (opts: IngestTabelogOptions) => {
  const areaById = new Map<string, (typeof areas)[number]>(areas.map((a) => [a.areaId, a]));
  let restaurants = await duckdb.selectFrom("restaurants").selectAll().execute();
  if (opts.url) restaurants = restaurants.filter((r) => r.url.includes(opts.url as string));
  if (opts.limit) restaurants = restaurants.slice(0, opts.limit);

  const crawled = await duckdb
    .selectFrom("crawled_restaurants")
    .select(["url", "features", "imageUrl"])
    .execute();
  const featuresByUrl = new Map(
    crawled.map((c) => [c.url, c.features as unknown as Record<string, string>]),
  );
  const imageUrlByUrl = new Map(crawled.map((c) => [c.url, c.imageUrl]));

  // 写真の優先順位: Google (Places API 由来、許諾あり) > Tabelog og:image (640px) > それ以外の既存 (Hotpepper 238px)
  const pickPhotos = (existingPhotos: unknown, tabelogImage: string | null | undefined): string => {
    const current = Array.isArray(existingPhotos) ? (existingPhotos as string[]) : [];
    if (current.some((u) => typeof u === "string" && u.includes("googleusercontent.com/"))) {
      return JSON.stringify(current);
    }
    if (tabelogImage) return JSON.stringify([tabelogImage]);
    return JSON.stringify(current);
  };

  let added = 0;
  let updated = 0;
  for (const r of restaurants) {
    const id = selfIdFromSourceUri(r.url);
    const existing = await db
      .selectFrom("places")
      .selectAll()
      .where("id", "==", id)
      .executeTakeFirst();

    const features = featuresByUrl.get(r.url) ?? {};
    const station = extractStation(features["交通手段"]);
    const nearest = parseNearestStation(features["交通手段"]);

    // 評価未取得 (Tabelog無点数) は既存値を温存。0.00表示を作らない。
    // 新規かつ無点数は取込自体を見送り (次回クロールで点数が付けば自動追加)
    const freshRating = typeof r.rating === "number" ? r.rating : null;
    if (!existing && freshRating === null) {
      consola.info(`skip unscored new store: ${r.name}`);
      continue;
    }
    const rating = freshRating ?? (existing?.rating as number | undefined) ?? 0;
    const userRatingCount =
      freshRating !== null
        ? Math.round(Number(r.reviewCount ?? 0))
        : ((existing?.userRatingCount as number | undefined) ?? 0);

    // 座標: 既存があれば温存、なければGSI (無料)
    let latitude = existing?.latitude ?? 0;
    let longitude = existing?.longitude ?? 0;
    if (!latitude || !longitude) {
      const geo = await geocodeBlock(r.address);
      if (geo) {
        latitude = geo.lat;
        longitude = geo.lng;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    await upsertPlace({
      id,
      googlePlaceId: existing?.googlePlaceId ?? null,
      displayName: r.name,
      // cidリンク温存、なければ店名+駅の検索URLを生成
      googleMapsUri: existing?.googleMapsUri ?? googleMapsSearchUrl(r.name, station ?? undefined),
      sourceUri: r.url,
      latitude,
      longitude,
      rating,
      userRatingCount,
      priceLevel: priceLevelOf([r.budgetDinner, r.budgetLunch]),
      // 営業時間: Tabelogの営業時間欄を構造化できたらそれを採用 (Google凍結値より新しい)。
      // 解析できなければ既存を温存。reviewsは既存温存 (Google-legacy凍結)、新規は空
      regularOpeningHours:
        asText(parseTabelogOpeningHours(features["営業時間"])) ??
        (existing ? asText(existing.regularOpeningHours) : null),
      photos: pickPhotos(existing?.photos, imageUrlByUrl.get(r.url)),
      reviews: existing ? (asText(existing.reviews) ?? "[]") : "[]",
      categories: JSON.stringify(r.categories.split(",")),
      genres: JSON.stringify(r.genres.split(",")),
      nearestStation: nearest?.station ?? existing?.nearestStation ?? null,
      stationDistance: nearest?.meters ?? existing?.stationDistance ?? null,
    });

    if (existing) updated++;
    else added++;

    // 新規店のリスティング (ranked由来。urlで引く)
    if (!existing) {
      const ranked = await duckdb
        .selectFrom("ranked_restaurants")
        .selectAll()
        .where("url", "==", r.url)
        .execute();
      for (const rk of ranked) {
        const area = areaById.get(rk.area);
        if (!area) continue;
        // 最寄駅がエリアの駅でない店 (隣駅の店) は載せない。最寄駅不明なら radius で判定
        if (!belongsToArea(area, nearest?.station, latitude, longitude)) continue;
        await db
          .insertInto("placeListings")
          .values({
            cityId: area.cityId,
            areaId: rk.area,
            categoryId: rk.category,
            rankingType: rk.ranking_type,
            placeId: id,
          })
          .onConflict((oc) => oc.doNothing())
          .execute();
      }
    }
  }
  consola.info(`ingest done: added=${added} updated=${updated}`);
  await pruneOutOfRangeListings(featuresByUrl);
};

// 既存の掲載で、エリアに属さなくなったもの (最寄駅が別、または範囲外) を place_listings / localized_places から外す
// (radius の見直しや座標の補正に追随するため毎回走らせる)
export const pruneOutOfRangeListings = async (
  featuresByUrl: Map<string, Record<string, string>>,
) => {
  const rows = await db
    .selectFrom("placeListings")
    .innerJoin("places", "places.id", "placeListings.placeId")
    .select([
      "placeListings.cityId",
      "placeListings.areaId",
      "placeListings.categoryId",
      "placeListings.rankingType",
      "placeListings.placeId",
      "places.latitude",
      "places.longitude",
      "places.sourceUri",
    ])
    .execute();
  const areaById = new Map<string, (typeof areas)[number]>(areas.map((a) => [a.areaId, a]));
  let pruned = 0;
  for (const row of rows) {
    const area = areaById.get(row.areaId);
    if (!area) continue;
    const station = parseNearestStation(
      featuresByUrl.get(row.sourceUri ?? "")?.["交通手段"],
    )?.station;
    if (belongsToArea(area, station, row.latitude, row.longitude)) continue;
    const key = {
      cityId: row.cityId,
      areaId: row.areaId,
      categoryId: row.categoryId,
      rankingType: row.rankingType,
      placeId: row.placeId,
    };
    await db
      .deleteFrom("localizedPlaces")
      .where("cityId", "==", key.cityId)
      .where("areaId", "==", key.areaId)
      .where("categoryId", "==", key.categoryId)
      .where("rankingType", "==", key.rankingType)
      .where("placeId", "==", key.placeId)
      .execute();
    await db
      .deleteFrom("placeListings")
      .where("cityId", "==", key.cityId)
      .where("areaId", "==", key.areaId)
      .where("categoryId", "==", key.categoryId)
      .where("rankingType", "==", key.rankingType)
      .where("placeId", "==", key.placeId)
      .execute();
    pruned++;
  }
  consola.info(`pruned out-of-range listings: ${pruned}`);
};

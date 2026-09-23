import { areas } from "@hyperlocal/consts";
import { db } from "@hyperlocal/db";
import { defineCommand } from "citty";
import consola from "consola";
import { UTCDate } from "@date-fns/utc";
import { format } from "date-fns";
import {
  distanceMeters,
  type HotpepperShop,
  nameSimilarity,
  searchShopsAround,
} from "~/features/hotpepper/client";

// 店舗写真をホットペッパーグルメ Webサービスから補完する (Google不使用・無料)。
// エリア中心から半径1kmの掲載店を全件取り、店名の類似度 + 距離で突合する。
// 既に写真がある店は触らない。表示側にクレジット表記が必要 (site-footer)。
export default defineCommand({
  meta: {
    name: "enrich-hotpepper",
    description: "写真の無い店にホットペッパーの店舗写真を突合して補完する",
  },
  args: {
    area: {
      type: "string",
      description: "エリアIDをカンマ区切り (省略時は全エリア)",
      default: undefined,
    },
    dryRun: { type: "boolean", description: "DBを更新せず突合結果だけ表示する" },
    minScore: { type: "string", description: "採用する類似度の下限 (既定 0.7)", default: "0.7" },
    maxDistance: { type: "string", description: "採用する距離の上限 m (既定 150)", default: "150" },
  },
  run: async ({ args }) => {
    const key = process.env.HOTPEPPER_API_KEY;
    if (!key) throw new Error("HOTPEPPER_API_KEY is not set");
    const areaIds = args.area ? new Set(args.area.split(",").map((s) => s.trim())) : null;
    const minScore = Number(args.minScore);
    const maxDistance = Number(args.maxDistance);

    let matched = 0;
    let candidates = 0;
    for (const area of areas.filter((a) => !areaIds || areaIds.has(a.areaId))) {
      const places = await db
        .selectFrom("places")
        .innerJoin("placeListings", "placeListings.placeId", "places.id")
        .where("placeListings.areaId", "==", area.areaId)
        .where((eb) => eb.or([eb("places.photos", "==", "[]"), eb("places.photos", "is", null)]))
        .select(["places.id", "places.displayName", "places.latitude", "places.longitude"])
        .distinct()
        .execute();
      if (places.length === 0) continue;

      const shops = await searchShopsAround(key, area.latitude, area.longitude, 3);
      consola.info(
        `${area.areaId}: ${places.length} places without photo, ${shops.length} hotpepper shops`,
      );
      candidates += places.length;

      // 密集エリアでは全件取得が上限 (1000件) で切れるので、その場合は店ごとに半径300mで補完検索する
      const capped = shops.length >= 1000;
      for (const place of places) {
        let best: { shop: HotpepperShop; score: number; dist: number } | null = null;
        const pool = capped
          ? [...shops, ...(await searchShopsAround(key, place.latitude, place.longitude, 1))]
          : shops;
        for (const shop of pool) {
          const dist = distanceMeters(
            place.latitude,
            place.longitude,
            Number(shop.lat),
            Number(shop.lng),
          );
          if (dist > maxDistance) continue;
          const score = nameSimilarity(place.displayName, shop.name);
          if (score < minScore) continue;
          if (!best || score > best.score || (score === best.score && dist < best.dist)) {
            best = { shop, score, dist };
          }
        }
        if (!best) continue;
        matched++;
        const photo = best.shop.photo?.pc?.l;
        consola.log(
          `  ${args.dryRun ? "[dry]" : "[set]"} ${place.displayName} <= ${best.shop.name} (score=${best.score.toFixed(2)}, ${Math.round(best.dist)}m)`,
        );
        if (args.dryRun || !photo) continue;
        await db
          .updateTable("places")
          .set({
            photos: JSON.stringify([photo]),
            updatedAt: format(new UTCDate(), "yyyy-MM-dd HH:mm:ss"),
          })
          .where("id", "==", place.id)
          .execute();
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    consola.info(`done: matched ${matched} / ${candidates}`);
  },
});

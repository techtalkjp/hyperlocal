import { db, sql, type LocalizedPlace } from "@hyperlocal/db";

export const listLocalizedPlaces = async ({
  cityId,
  areaId,
  categoryId,
  language,
  rankingType = "rating",
}: {
  cityId: string;
  areaId: string;
  categoryId: string;
  language: string;
  rankingType: "review" | "rating";
}) => {
  let query = db
    .selectFrom("localizedPlaces")
    .select([
      "cityId",
      "areaId",
      "categoryId",
      "placeId",
      "language",
      "genres",
      "displayName",
      "originalDisplayName",
      "rating",
      "userRatingCount",
      "latitude",
      "longitude",
      "googleMapsUri",
      "sourceUri",
      "priceLevel",
      "regularOpeningHours",
      "nearestStation",
      "stationDistance",
      () =>
        sql`
          CASE WHEN JSON_ARRAY_LENGTH(reviews) > 0 THEN
            JSON_ARRAY
            (
              JSON_SET(
                JSON_EXTRACT(reviews, '$[0]'),
                '$.text',
                SUBSTRING(
                  JSON_EXTRACT(reviews, '$[0].text'),
                  1,
                  350
                )
              )
            )
          ELSE JSON_ARRAY() END`.as("reviews"), // 最初のレビューだけ (350文字まで)。空なら [] (null要素を作らない)
      () =>
        sql`CASE WHEN JSON_ARRAY_LENGTH(photos) > 0 THEN JSON_ARRAY(JSON_EXTRACT(photos, '$[0]')) ELSE JSON_ARRAY() END`.as(
          "photos",
        ), // 最初の写真だけ。空なら [] (null要素を作らない)
    ])
    .distinct()
    .where("cityId", "==", cityId)
    .where("localizedPlaces.areaId", "==", areaId)
    .where("localizedPlaces.categoryId", "==", categoryId)
    .where("localizedPlaces.rankingType", "==", rankingType)
    .where("localizedPlaces.language", "==", language)
    .where("localizedPlaces.rating", ">", 0)
    .limit(100);

  if (rankingType === "rating") {
    query = query.orderBy(["rating desc", "userRatingCount desc"]);
  }
  if (rankingType === "review") {
    query = query.orderBy(["userRatingCount desc", "rating desc"]);
  }

  return (await query.execute()) as unknown as LocalizedPlace[];
};

import { sql } from 'kysely'
import { db } from '~/services/duckdb.server'

export const transform = async () => {
  // ジャンル/カテゴリ変換用のテーブルを作成 (INNER JOIN で使うのに必須)
  await db.schema.dropTable('genres').ifExists().execute()
  await db.schema
    .createTable('genres')
    .as(db.selectFrom('tabelog_genres').selectAll())
    .execute()

  // ジャンル/カテゴリを変換したレストランデータを生成
  await db.schema.dropTable('restaurants').ifExists().execute()
  await db.schema
    .createTable('restaurants')
    .as(
      // ジャンルごとに１行に展開
      db
        .with('tabelog_restaurants_genres', (db) =>
          db
            .selectFrom('crawled_restaurants')
            .select([
              'url',
              'area',
              'name',
              'rating',
              'reviewCount',
              'budgetLunch',
              'budgetDinner',
              'closedDay',
              'address',
              () =>
                sql<string>`unnest(string_split(features->>'ジャンル', '、'))`.as(
                  'genre',
                ),
            ]),
        )
        // ジャンルごとにカテゴリを付与
        .with('categorized_restaurants_genres', (db) =>
          db
            .selectFrom('tabelog_restaurants_genres')
            .innerJoin(
              'genres',
              'tabelog_restaurants_genres.genre',
              'genres.id',
            )
            .select([
              'tabelog_restaurants_genres.area',
              () =>
                sql<string>`
            CASE WHEN genres.category = 'restaurant' AND tabelog_restaurants_genres.budgetLunch != '-' THEN 'lunch'
        		WHEN genres.category = 'restaurant' AND tabelog_restaurants_genres.budgetDinner != '-' THEN 'dinner'
        		ELSE genres.category END`.as('category'),
              'genres.genre',
              'tabelog_restaurants_genres.name',
              'tabelog_restaurants_genres.rating',
              'tabelog_restaurants_genres.reviewCount',
              'tabelog_restaurants_genres.budgetLunch',
              'tabelog_restaurants_genres.budgetDinner',
              'tabelog_restaurants_genres.closedDay',
              'tabelog_restaurants_genres.address',
              'tabelog_restaurants_genres.url',
            ]),
        )
        // レストランごとにジャンルを集約
        .with('transformed_restaurants', (db) =>
          db
            .selectFrom('categorized_restaurants_genres')
            .select([
              'area',
              () =>
                sql<string>`group_concat(DISTINCT category)`.as('categories'),
              () => sql<string>`group_concat(DISTINCT genre)`.as('genres'),
              'name',
              'rating',
              'reviewCount',
              'budgetLunch',
              'budgetDinner',
              'closedDay',
              'address',
              'url',
            ])
            .groupBy([
              'area',
              'name',
              'rating',
              'reviewCount',
              'budgetLunch',
              'budgetDinner',
              'closedDay',
              'address',
              'url',
            ]),
        )
        .selectFrom('transformed_restaurants')
        .selectAll(),
    )
    .execute()

  const ret = await db.selectFrom('restaurants').selectAll().limit(10).execute()

  console.log(ret)
}

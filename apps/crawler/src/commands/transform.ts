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
  // レストランテーブルを作成し、'url'を主キーとして定義
  await db.schema
    .createTable('restaurants')
    .ifNotExists()
    .addColumn('url', 'varchar', (col) => col.primaryKey())
    .addColumn('area', 'varchar', (col) => col.notNull())
    .addColumn('categories', 'varchar', (col) => col.notNull())
    .addColumn('genres', 'varchar', (col) => col.notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('rating', 'float4')
    .addColumn('reviewCount', 'integer')
    .addColumn('budgetLunch', 'varchar')
    .addColumn('budgetDinner', 'varchar')
    .addColumn('closedDay', 'varchar')
    .addColumn('address', 'varchar')
    .addColumn('placeId', 'varchar')
    .execute()

  await db
    .insertInto('restaurants')
    .columns([
      'area',
      'categories',
      'genres',
      'name',
      'rating',
      'reviewCount',
      'budgetLunch',
      'budgetDinner',
      'closedDay',
      'address',
      'url',
      'placeId',
    ])
    .expression(
      // The query that generates new restaurant data
      db
        .with('tabelog_restaurants_genres', (db) =>
          db
            .selectFrom('crawled_restaurants')
            .selectAll()
            .select([
              () =>
                sql<string>`unnest(string_split(features->>'ジャンル', '、'))`.as(
                  'genre',
                ),
            ]),
        )
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
        .selectFrom('categorized_restaurants_genres')
        .select([
          'area',
          () => sql<string>`group_concat(DISTINCT category)`.as('categories'),
          () => sql<string>`group_concat(DISTINCT genre)`.as('genres'),
          'name',
          'rating',
          () => sql<number>`reviewCount::integer`.as('reviewCount'),
          'budgetLunch',
          'budgetDinner',
          'closedDay',
          'address',
          'url',
          () => sql<null>`null::varchar`.as('placeId'),
        ])
        .where('category', '!=', 'restaurant')
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
    .onConflict((oc) =>
      oc.column('url').doUpdateSet({
        area: (eb) => eb.ref('excluded.area'),
        categories: (eb) => eb.ref('excluded.categories'),
        genres: (eb) => eb.ref('excluded.genres'),
        name: (eb) => eb.ref('excluded.name'),
        rating: (eb) => eb.ref('excluded.rating'),
        reviewCount: (eb) => eb.ref('excluded.reviewCount'),
        budgetLunch: (eb) => eb.ref('excluded.budgetLunch'),
        budgetDinner: (eb) => eb.ref('excluded.budgetDinner'),
        closedDay: (eb) => eb.ref('excluded.closedDay'),
        address: (eb) => eb.ref('excluded.address'),
        // Do not update 'placeId' to preserve existing data
      }),
    )
    .execute()

  // エリア・カテゴリ別ランキングを生成
  db.schema.dropTable('ranked_restaurants').ifExists().execute()
  db.schema
    .createTable('ranked_restaurants')
    .as(
      db
        // カテゴリごとのレストランデータ
        .with('categorized_restaurants', (db) =>
          db
            .selectFrom('restaurants')
            .select([
              'area',
              () => sql`unnest(string_split(categories, ','))`.as('category'),
              'genres',
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
        // レートでのエリア・カテゴリランキング
        .with('rating_rank', (db) =>
          db
            .selectFrom('categorized_restaurants')
            .selectAll()
            .select([
              () => sql<string>`'rating'`.as('ranking_type'),
              () =>
                sql<number>`row_number() OVER (PARTITION BY area, category ORDER BY rating DESC)::integer`.as(
                  'rank',
                ),
            ]),
        )
        .with('review_rank', (db) =>
          db
            .selectFrom('categorized_restaurants')
            .selectAll()
            .select([
              () => sql<string>`'review'`.as('ranking_type'),
              () =>
                sql<number>`row_number() OVER (PARTITION BY area, category ORDER BY reviewCount DESC)::integer`.as(
                  'rank',
                ),
            ]),
        )
        .with('ranked_restaurants', (db) =>
          db
            .selectFrom('rating_rank')
            .select([
              'area',
              'category',
              'ranking_type',
              'rank',
              'genres',
              'name',
              'rating',
              'reviewCount',
              'budgetLunch',
              'budgetDinner',
              'closedDay',
              'address',
              'url',
            ])
            .unionAll(
              db
                .selectFrom('review_rank')
                .select([
                  'area',
                  'category',
                  'ranking_type',
                  'rank',
                  'genres',
                  'name',
                  'rating',
                  'reviewCount',
                  'budgetLunch',
                  'budgetDinner',
                  'closedDay',
                  'address',
                  'url',
                ]),
            ),
        )
        .selectFrom('ranked_restaurants')
        .selectAll()
        .select(() => sql<null>`null::varchar`.as('placeId'))
        .where('rank', '<=', 20),
    )
    .execute()

  // ランク外のレストランを削除
  await sql`
    DELETE FROM restaurants
    WHERE url NOT IN (
      SELECT url 
      FROM ranked_restaurants
    )`.execute(db)

  const { cnt } = await db
    .selectFrom('restaurants')
    .select((eb) => eb.fn.countAll().as('cnt'))
    .executeTakeFirstOrThrow()
  console.log(`${cnt} restaurants transformed`)
}

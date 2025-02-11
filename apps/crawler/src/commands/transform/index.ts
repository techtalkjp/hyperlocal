import { defineCommand } from 'citty'
import consola from 'consola'
import { sql } from 'kysely'
import { db } from '~/services/duckdb.server'

export default defineCommand({
  meta: {
    name: 'transform',
    description:
      '食べログのデータをリスティング用のデータに変換する。ランキング外のデータは除外される',
  },
  run: async () => {
    await transform()
  },
})

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

  // Step 1: ジャンルを抽出してテーブルに保存
  consola.info('step 1: ジャンルを抽出してテーブルに保存')
  await db.schema
    .dropTable('tr_tabelog_restaurants_genres')
    .ifExists()
    .execute()
  await db.schema
    .createTable('tr_tabelog_restaurants_genres')
    .as(
      db
        .selectFrom('crawled_restaurants')
        .selectAll()
        .select([
          sql<string>`unnest(string_split(features->>'ジャンル', '、'))`.as(
            'genre',
          ),
        ]),
    )
    .execute()

  // Step 2: レストランデータをジャンル/カテゴリ付きで生成
  consola.info('step 2: レストランデータをジャンル/カテゴリ付きで生成')
  await db.schema
    .dropTable('tr_restaurants_with_genre_categories')
    .ifExists()
    .execute()
  await db.schema
    .createTable('tr_restaurants_with_genre_categories')
    .as(
      db
        .selectFrom('tr_tabelog_restaurants_genres')
        .innerJoin('genres', 'tr_tabelog_restaurants_genres.genre', 'genres.id')
        .select([
          'tr_tabelog_restaurants_genres.area',
          'genres.genre',
          'tr_tabelog_restaurants_genres.name',
          'tr_tabelog_restaurants_genres.rating',
          'tr_tabelog_restaurants_genres.reviewCount',
          'tr_tabelog_restaurants_genres.budgetLunch',
          'tr_tabelog_restaurants_genres.budgetDinner',
          'tr_tabelog_restaurants_genres.closedDay',
          'tr_tabelog_restaurants_genres.address',
          'tr_tabelog_restaurants_genres.url',
          // Construct categories array
          sql<string[]>`CASE
            WHEN genres.category != 'restaurant' THEN [genres.category]
            ELSE list_concat(
              CASE WHEN tr_tabelog_restaurants_genres.budgetLunch != '-' THEN ['lunch'] ELSE [] END,
              CASE WHEN tr_tabelog_restaurants_genres.budgetDinner != '-' THEN ['dinner'] ELSE [] END
            )
          END`.as('categories'),
        ]),
    )
    .execute()

  // Step 2-1: カテゴリを展開してテーブルに保存
  consola.info('step 2-1: カテゴリを展開してテーブルに保存')
  await db.schema.dropTable('tr_expanded_restaurants').ifExists().execute()
  await db.schema
    .createTable('tr_expanded_restaurants')
    .as(
      db
        .selectFrom('tr_restaurants_with_genre_categories')
        .select([
          'area',
          'genre',
          'name',
          'rating',
          'reviewCount',
          'budgetLunch',
          'budgetDinner',
          'closedDay',
          'address',
          'url',
          sql<string>`unnest(categories)`.as('category'),
        ]),
    )
    .execute()

  // Step 3: レストランデータを生成
  consola.info('step 3: レストランデータを生成')
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
      db
        .selectFrom('tr_expanded_restaurants')
        .select([
          'area',
          // Aggregate categories back into a string
          sql<string>`group_concat(DISTINCT category, ',')`.as('categories'),
          sql<string>`group_concat(DISTINCT genre, ',')`.as('genres'),
          'name',
          'rating',
          sql<number>`CAST(reviewCount AS INTEGER)`.as('reviewCount'),
          'budgetLunch',
          'budgetDinner',
          'closedDay',
          'address',
          'url',
          sql<null>`NULL::VARCHAR`.as('placeId'),
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
        // 'placeId' は更新しない
      }),
    )
    .execute()

  // Step 4: ランキングテーブルを生成
  consola.info('step 4: ランキングテーブルを生成')
  await db.schema.dropTable('tr_restaurants_by_category').ifExists().execute()
  await db.schema
    .createTable('tr_restaurants_by_category')
    .as(
      db
        .selectFrom('restaurants')
        .select([
          'area',
          sql<string>`unnest(string_split(categories, ','))`.as('category'),
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
        ]),
    )
    .execute()
  await db.schema.dropTable('tr_rating_rank').ifExists().execute()
  await db.schema
    .createTable('tr_rating_rank')
    .as(
      db
        .selectFrom('tr_restaurants_by_category')
        .select([
          'area',
          'category',
          sql<string>`'rating'`.as('ranking_type'),
          sql<number>`ROW_NUMBER() OVER (PARTITION BY area, category ORDER BY rating DESC)`.as(
            'rank',
          ),
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
        ]),
    )
    .execute()

  await db.schema.dropTable('tr_review_rank').ifExists().execute()
  await db.schema
    .createTable('tr_review_rank')
    .as(
      db
        .selectFrom('tr_restaurants_by_category')
        .select([
          'area',
          'category',
          sql<string>`'review'`.as('ranking_type'),
          sql<number>`ROW_NUMBER() OVER (PARTITION BY area, category ORDER BY reviewCount DESC)`.as(
            'rank',
          ),
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
        ]),
    )
    .execute()

  // step 5: ランキングテーブルを生成
  consola.info('step 5: ランキングテーブルを生成')
  await db.schema.dropTable('ranked_restaurants').ifExists().execute()
  await db.schema
    .createTable('ranked_restaurants')
    .addColumn('area', 'varchar')
    .addColumn('category', 'varchar')
    .addColumn('ranking_type', 'varchar')
    .addColumn('rank', 'integer')
    .addColumn('genres', 'varchar')
    .addColumn('name', 'varchar')
    .addColumn('rating', 'float4')
    .addColumn('reviewCount', 'integer')
    .addColumn('budgetLunch', 'varchar')
    .addColumn('budgetDinner', 'varchar')
    .addColumn('closedDay', 'varchar')
    .addColumn('address', 'varchar')
    .addColumn('url', 'varchar')
    .addColumn('placeId', 'varchar')
    .execute()
  await db
    .insertInto('ranked_restaurants')
    .columns([
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
      'placeId',
    ])
    .expression(
      db
        .selectFrom('tr_rating_rank')
        .selectAll()
        .unionAll(db.selectFrom('tr_review_rank').selectAll()),
      // .selectAll(),
    )
    .execute()

  // step6: 20位より下のレストランをランキングから削除
  consola.info('step 6: 20位より下のレストランをランキングから削除')
  await db.deleteFrom('ranked_restaurants').where('rank', '>', 20).execute()

  // step7: ランキング外のレストランを削除
  consola.info('step 7: ランキング外のレストランを削除')
  await sql`
    DELETE FROM restaurants
    WHERE url NOT IN (
      SELECT url FROM ranked_restaurants
    );
  `.execute(db)

  // Log the number of restaurants transformed
  const { cnt } = await db
    .selectFrom('restaurants')
    .select((eb) => eb.fn.countAll().as('cnt'))
    .executeTakeFirstOrThrow()
  consola.info(`${cnt} restaurants transformed`)
}

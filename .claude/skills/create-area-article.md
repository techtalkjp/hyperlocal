# create-area-article

エリアとシーンを指定して、DBの実際のPlaceデータを使った記事を作成し、JSONファイルに保存してDBに登録します。

## Steps

1. **エリアとシーンを確認**
   - 利用可能なエリアとシーンのリストを表示
   - ユーザーに選択してもらう

2. **DBからPlaceデータを取得**
   - 指定されたエリアのPlaceデータをクエリ
   - Rating順でTop 10-15件を取得
   - 各お店のカテゴリー、評価、価格帯、レビューを確認

3. **記事を執筆**
   - シーンに合った構成で記事を書く
   - 実際のお店を `<Place id="..." />` コンポーネントで埋め込む
   - 3-5件のお店を紹介
   - お店の特徴を自然な文章で紹介

4. **JSONファイルに保存**
   - `content/articles/{area}-{scene}.json` に保存
   - 以下の形式で保存:
     ```json
     {
       "area": "area-id",
       "scene": "scene-id",
       "language": "ja",
       "title": "記事タイトル",
       "description": "記事の説明（SEO用）",
       "content": "記事本文（MDX形式）",
       "status": "published"
     }
     ```

5. **CLIで登録**
   - `pnpm --filter @hyperlocal/admin generate:article --file content/articles/{area}-{scene}.json` を実行
   - 登録結果のURL（Admin/Web）を表示

## Database Query Example

```sql
SELECT p.id, p.display_name, p.rating, p.user_rating_count, p.price_level, pl.category_id
FROM places p
INNER JOIN place_listings pl ON p.id = pl.place_id
WHERE pl.area_id = '{area}' AND pl.ranking_type = 'rating'
ORDER BY p.rating DESC, p.user_rating_count DESC
LIMIT 15;
```

## Article Structure Guidelines

### シーン別の構成例

**morning-cafe (朝カフェ)**
- 早朝から営業しているカフェ
- モーニングメニューがあるお店
- 静かに過ごせる空間

**lunch-spot (ランチスポット)**
- コスパの良いランチ
- 人気の定食屋やレストラン
- ビジネスマン・観光客向け

**afternoon-break (午後の休憩)**
- カフェ、スイーツ
- ゆったり過ごせる空間
- 14:00-17:00頃に営業

**dinner-date (ディナー・デート)**
- 雰囲気の良いレストラン
- 価格帯は中〜高め
- デートに適した空間

**late-night (深夜営業)**
- 深夜まで営業
- ラーメン、居酒屋、バー
- 終電後も利用可能

**solo-dining (一人ごはん)**
- カウンター席充実
- 一人客が多い
- 気兼ねなく入れる

**local-favorite (地元で人気)**
- 観光地化していない
- 地元の常連客が多い
- 隠れた名店

## MDX Format

記事は以下の形式で書く:

```markdown
# 記事タイトル

導入文（エリアとシーンの雰囲気を紹介）

## セクション1

文章での紹介

<Place id="place-id-1" />

お店の特徴や雰囲気を説明

## セクション2

<Place id="place-id-2" />

...

## まとめ

エリアの魅力を再度強調
```

## Notes

- 記事は日本語で書く（language: "ja"）
- お店のIDは必ずDBに存在するものを使う
- 1記事につき3-5件のお店を紹介
- お店の選択はシーンに適したものを優先
- 自然な文章で、観光ガイドっぽくならないように
- 地元の人の視点を大切に

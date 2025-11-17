---
name: create-area-article
description: エリアとシーンを指定して、DBの実際のPlaceデータを使った記事を作成・登録。レビュー内容を正確に読み取り、写真を確認して、実際の店舗情報に基づいた記事を執筆します。Use when creating area guide articles or when the user mentions writing articles about restaurants or local spots.
---

# create-area-article

エリアとシーンを指定して、DBの実際のPlaceデータを使った記事を作成し、JSONファイルに保存してDBに登録します。

## Steps

1. **エリアとシーンを確認**
   - 利用可能なエリアとシーンのリストを表示
   - ユーザーに選択してもらう

2. **DBからPlaceデータを取得**
   - 提供されているスクリプトを使用してデータを取得:
     ```bash
     DATABASE_URL="file:./data/dev.db" npx tsx .claude/skills/scripts/get-places-for-article.ts --area <area-id> --language <lang>
     ```
   - Rating順でTop 10-15件を取得（デフォルト15件）
   - 出力はJSON形式で、以下の情報が含まれます:
     - id (Place ID)
     - displayName (ローカライズされた店名)
     - originalDisplayName (元の店名)
     - rating (評価)
     - userRatingCount (レビュー数)
     - priceLevel (価格帯)
     - genres (ジャンル配列)
     - photos (写真URL配列)
     - reviews (レビュー配列)
   - **重要**: レビューは複数件（最低2件）読み、料理タイプや特徴を正確に把握する
   - **写真**: photos配列の最初の画像を確認して、お店の雰囲気を理解する

3. **記事を執筆**
   - **CRITICAL: レビューに書かれた内容を最優先し、推測や創作はしない**
   - レビューに記載の料理タイプや特徴をそのまま使用
   - 店名やカテゴリーだけで判断せず、必ずレビュー内容を確認
   - 写真URLがある場合は、写真を確認してお店の雰囲気を理解
   - シーンに合った構成で記事を書く
   - 実際のお店を `<Place id="..." />` コンポーネントで埋め込む
   - 3-5件のお店を紹介
   - お店の特徴を自然な文章で紹介（レビューの内容に基づく）

4. **JSONファイルに保存**
   - 提供されているスクリプトを使用して保存:
     ```bash
     # 一時JSONファイルを作成して保存
     cat > /tmp/article.json << 'EOF'
     {
       "area": "area-id",
       "scene": "scene-id",
       "language": "ja",
       "title": "記事タイトル",
       "description": "記事の説明（SEO用）",
       "content": "記事本文（MDX形式）",
       "status": "published"
     }
     EOF
     npx tsx .claude/skills/scripts/save-article.ts /tmp/article.json
     ```
   - スクリプトは自動的に `content/articles/{area}-{scene}.json` に保存します

5. **CLIで登録**
   - `pnpm --filter @hyperlocal/admin generate:article --file content/articles/{area}-{scene}.json` を実行
   - 登録結果のURL（Admin/Web）を表示

## データ取得スクリプトの使用例

提供されているスクリプトを使ってPlaceデータを取得:

```bash
# 浅草エリアの日本語データを取得
DATABASE_URL="file:./data/dev.db" npx tsx .claude/skills/scripts/get-places-for-article.ts --area asakusa --language ja

# 限定数を指定（デフォルトは15件）
DATABASE_URL="file:./data/dev.db" npx tsx .claude/skills/scripts/get-places-for-article.ts --area shibuya --language ja --limit 10
```

**Note**: DATABASE_URLにはローカル開発DBのパス `file:./data/dev.db` を指定します。

スクリプトは以下を含むJSON配列を返します:
- Place ID
- 店名（ローカライズ版と元の名前）
- 評価とレビュー数
- 価格帯
- ジャンル
- 写真URL（配列）
- レビュー（配列、各レビューにtext、rating、publishedTimeを含む）

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

## 記事執筆時の重要な注意事項

### レビューの正確性

- レビューに書かれた料理タイプや特徴を正確に反映すること
- 店名から推測せず、必ずレビュー内容を読むこと
- レビューに記載された料理タイプをそのまま使用すること
- レビューの情報が店名やカテゴリーと矛盾する場合、レビューを優先

### 写真の活用

- 写真URLがある場合は、必ず写真を確認してお店の雰囲気を把握
- 写真から読み取れる情報（内装、料理の見た目、客層など）を記事に活かす

### 情報の優先順位

1. レビューの内容（最優先）
2. 写真から読み取れる情報
3. 評価、価格帯などの数値データ
4. カテゴリーや店名（参考程度）

# エリア記事の管理ワークフロー

## 概要

エリアガイド記事の作成、更新、本番反映のワークフローを説明します。

## ディレクトリ構成

- `content/articles/` - 記事のソースファイル（JSON形式）
- `apps/admin/scripts/` - 記事管理用スクリプト
- `data/dev.db` - ローカルデータベース

## 記事ファイルの形式

`content/articles/{area}-{scene}.json`:

```json
{
  "area": "shibuya",
  "scene": "solo-dining",
  "language": "ja",
  "title": "渋谷で一人ご飯を楽しむ",
  "description": "メタディスクリプション（SEO用）",
  "content": "# タイトル\n\n記事本文...\n\n<Place id=\"place-id\" />",
  "status": "published",
  "city": "tokyo"
}
```

### 記事内でのPlace参照

記事のMDXコンテンツ内で `<Place id="place-id" />` を使用してお店情報を埋め込めます。

## ワークフロー

### 1. 記事の作成・編集

#### 単一記事の作成

```bash
# コマンドライン引数で作成
pnpm --filter @hyperlocal/admin generate:article \
  --area shibuya \
  --scene solo-dining \
  --title "渋谷で一人ご飯を楽しむ" \
  --description "メタディスクリプション" \
  --content "記事本文"

# JSONファイルから作成
pnpm --filter @hyperlocal/admin generate:article \
  --file content/articles/shibuya-solo-dining.json
```

#### 記事ファイルの直接編集

`content/articles/` 内のJSONファイルを直接編集します。

### 2. 記事の一括登録・更新

`content/articles/` 内の全JSONファイルをデータベースに反映：

```bash
pnpm --filter @hyperlocal/admin import:articles
```

このコマンドは：
- 既存の記事を削除（同じ area, scene, language の組み合わせ）
- 新しい記事を登録
- 処理結果のサマリーを表示

### 3. 本番環境への反映

#### データベースのアップロード

ローカルDBを本番環境（R2）にアップロード：

```bash
pnpm --filter @hyperlocal/web upload:db
```

#### 本番DBの取得（必要に応じて）

本番DBをローカルにダウンロード：

```bash
pnpm --filter @hyperlocal/web make:replica
```

## 自動化されたワークフロー（推奨）

1. **記事作成・編集**: `content/articles/` 内のJSONファイルを編集
2. **一括反映**: `pnpm --filter @hyperlocal/admin import:articles` で全記事を更新
3. **本番反映**: `pnpm --filter @hyperlocal/web upload:db` でDBをアップロード

### ワンライナー

```bash
pnpm --filter @hyperlocal/admin import:articles && \
pnpm --filter @hyperlocal/web upload:db
```

## 利用可能なArea/Scene

利用可能なarea, sceneのリストを表示：

```bash
pnpm --filter @hyperlocal/admin generate:article --list
```

## トラブルシューティング

### 記事が表示されない

1. データベースに記事が登録されているか確認：
   ```bash
   sqlite3 data/dev.db "SELECT id, title, status FROM area_articles"
   ```

2. ステータスが `published` になっているか確認

3. 本番DBにアップロードしたか確認

### Place IDの確認方法

1. Admin画面でお店を検索
2. URLまたはデータベースからplace IDを取得：
   ```bash
   sqlite3 data/dev.db "SELECT id, display_name FROM places WHERE area_id = 'shibuya' LIMIT 10"
   ```

## 今後の改善案

- CI/CDパイプラインでの自動デプロイ
- 記事のバリデーション（place IDの存在チェック等）
- 記事プレビュー機能の強化
- 多言語版記事の一括生成

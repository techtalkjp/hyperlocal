# データベース運用フロー

このドキュメントではHyperlocalプロジェクトのデータベース運用フローを説明する。

## システム構成

本プロジェクトでは以下のようなデータベース構成を採用している。

- **本番DB**: Turso (クラウドホスト型SQLite)
- **配信DB**: Cloudflare R2 (Object Storage) に配置したSQLiteファイル
- **ローカルDB**:
  - `data/dev.db`: 開発用DB（Prismaマイグレーション管理）
  - `data/production-replica.db`: 本番データのコピー（読み取り専用）

## データフロー概要

```mermaid
Crawler → DuckDB → Turso (本番DB) → R2 (配信用) → Fly.io (本番アプリ)
                          ↓
                    make:replica
                          ↓
               production-replica.db
                          ↓
                    db:reset (コピー)
                          ↓
                       dev.db
```

## 1. データ収集フェーズ (Crawler)

### 実行場所

`packages/gmap-scraper` または関連するcrawlerパッケージ

### 処理内容

1. Google Maps APIやスクレイピングでplace情報を収集
2. DuckDBに一時保存 (`data/crawl.duckdb`)
3. データクレンジング・加工
4. Tursoへデータを投入

### 使用コマンド

```bash
# crawler実行 (詳細はcrawlerパッケージのREADME参照)
pnpm --filter @hyperlocal/crawler crawl
```

## 2. スキーマ変更とマイグレーション

### 2.1 ローカル開発でのマイグレーション

**新しい運用方針**: `dev.db` は通常のPrisma開発フローで管理し、`production-replica.db` は本番データの参照用として分離する。

```bash
cd packages/db

# 1. スキーマファイルを編集
vim prisma/schema.prisma

# 2. Prismaの標準コマンドでマイグレーション作成・適用
pnpm prisma migrate dev --name add_something

# これで dev.db に対してマイグレーションが適用される
```

### 2.2 本番DBへのマイグレーション適用

ローカルで動作確認後、本番DBにマイグレーションを適用する。

```bash
cd packages/db

# .env.productionに本番Tursoの接続情報を設定（初回のみ）
cp .env.production.example .env.production
# TURSO_DATABASE_URL, TURSO_AUTH_TOKENを設定

# 本番DBにマイグレーション適用
pnpm migrate:production
```

このスクリプト (`scripts/push-to-production.ts`) は以下を実行する:

1. Tursoに接続
2. 適用済みマイグレーション一覧を取得
3. 未適用のマイグレーションを順次適用
4. `_prisma_migrations` テーブルに記録

## 3. 配信用DBの更新

マイグレーション適用後、配信用のDBファイルを更新する必要がある。

```bash
cd apps/web

# 1. Tursoから最新のDBをローカルにダウンロード
pnpm make:replica

# 2. R2に配信用DBをアップロード
pnpm upload:db
```

### スクリプトの詳細

**`make:replica`** (`apps/web/scripts/make-local-replica.ts`):

- Tursoから `data/production-replica.db` にデータをダウンロード
- 既存のレプリカDBは削除される
- **注意**: `dev.db` は変更されない（開発中のマイグレーションを保持）

**`upload:db`** (`apps/web/scripts/upload-db.ts`):

- ローカルの `data/dev.db` をR2の `db/hyperlocal.db` にアップロード
- Fly.ioアプリはこのR2上のDBファイルを参照

## 4. 本番アプリへのデプロイ

```bash
# webアプリのビルドとデプロイ
pnpm deploy
```

デプロイ時、Fly.ioアプリは起動時にR2から最新のDBファイルをダウンロードして使用する。

## 5. 開発環境での作業

### 初回セットアップ

```bash
# 1. 本番データをダウンロード
cd apps/web
pnpm make:replica

# 2. dev.db にコピー（初回のみ）
pnpm db:reset

# 3. 開発サーバー起動
pnpm dev
```

### 日常的な開発（Prisma標準フロー）

```bash
# 1. スキーマ変更
cd packages/db
vim prisma/schema.prisma

# 2. マイグレーション作成・適用（dev.db に対して）
pnpm prisma migrate dev --name add_something

# 3. 開発サーバーで動作確認
cd ../../apps/web
pnpm dev
```

### 本番データで動作確認したい場合

```bash
cd apps/web

# 最新の本番データをダウンロード
pnpm make:replica

# dev.db を本番データで上書き（開発中の変更は失われる）
pnpm db:reset

# 開発サーバー起動
pnpm dev
```

## 6. Article管理フロー

Article（ガイド記事）の追加・更新は別フローで管理される。

```bash
cd apps/admin

# 単一記事の生成
pnpm generate:article --area <area-id> --scene <scene-id> --title <title>

# バッチインポート
pnpm import:articles
```

詳細は `docs/article-workflow.md` を参照。

## トラブルシューティング

### Prisma migration devが失敗する

ローカルDBの`_prisma_migrations`テーブルの履歴とマイグレーションファイルが不整合の場合に発生。

**解決方法**:
1. 新しいマイグレーションファイルを手動作成（前述の方法A）
2. `pnpm migrate:production` で本番に直接適用
3. `pnpm make:replica` で最新DBを取得

### インデックス追加などの非破壊的変更

データを失わないスキーマ変更（インデックス追加など）の場合:

```bash
# 1. schema.prismaを編集してインデックスを追加

# 2. マイグレーションファイルを手動作成
cd packages/db
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_add_index_name
echo "CREATE INDEX IF NOT EXISTS index_name ON table_name(column1, column2);" > prisma/migrations/$(date +%Y%m%d%H%M%S)_add_index_name/migration.sql

# 3. 本番DBに適用
pnpm migrate:production

# 4. ローカルDBに直接適用（開発中のデータを保持）
sqlite3 ../../data/dev.db "CREATE INDEX IF NOT EXISTS index_name ON table_name(column1, column2);"

# 5. R2に配信用DBをアップロード
cd ../../apps/web
pnpm make:replica
pnpm upload:db
```

## まとめ

### プロジェクトルートから実行できる主なコマンド

```bash
# ローカル開発
pnpm db:migrate                    # Prismaマイグレーション作成・適用（dev.dbに対して）
pnpm db:replica                    # Tursoから本番データをダウンロード（production-replica.dbへ）
pnpm db:reset                      # production-replica.db → dev.db にコピー

# 本番環境への適用
pnpm db:migrate:production         # Tursoにマイグレーション適用
pnpm db:fix:checksums              # Tursoのマイグレーションchecksum修正
pnpm db:upload                     # dev.db → R2へアップロード
pnpm deploy                        # Fly.ioへデプロイ

# その他
pnpm --filter @hyperlocal/crawler crawl              # データ収集
pnpm --filter @hyperlocal/admin generate:article ... # 記事生成
```

### 典型的なワークフロー

#### ローカル開発（初回）

```bash
pnpm db:replica    # 本番データをダウンロード
pnpm db:reset      # dev.db にコピー
pnpm dev           # 開発サーバー起動
```

#### スキーマ変更時

```bash
# 1. スキーマ編集
vim packages/db/prisma/schema.prisma

# 2. ローカルでマイグレーション適用
pnpm db:migrate --name add_feature

# 3. 動作確認
pnpm dev

# 4. 本番に適用
pnpm db:migrate:production

# 5. 配信用DB更新
pnpm db:replica
pnpm db:upload

# 6. デプロイ
pnpm deploy
```

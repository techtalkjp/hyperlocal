# データベース運用フロー

このドキュメントではHyperlocalプロジェクトのデータベース運用フローを説明する。

## システム構成

本プロジェクトでは以下のようなデータベース構成を採用している。

- **本番DB**: Turso (クラウドホスト型SQLite)
- **配信DB**: Cloudflare R2 (Object Storage) に配置したSQLiteファイル
- **ローカルDB**:
  - `data/dev.db`: 開発用DB（Atlas宣言的スキーマ管理）
  - `data/production-replica.db`: 本番データのコピー（読み取り専用）

## ツール構成

- **Atlas**: 宣言的スキーマ管理（マイグレーションファイル不要）
- **Kysely**: タイプセーフなクエリビルダー（CamelCasePlugin + ParseJSONResultsPlugin）
- **kysely-codegen**: 実データベースからTypeScript型を生成

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

## 2. スキーマ変更

### 2.1 ローカル開発でのスキーマ変更

Atlas の宣言的スキーマ管理により、望ましい状態を `schema.sql` に定義するだけで良い。

```bash
cd packages/db

# 1. スキーマファイルを編集
vim schema.sql

# 2. 差分を確認（dry-run）
pnpm db:diff

# 3. ローカルDBに適用
pnpm db:apply

# 4. TypeScript型を再生成
pnpm db:generate

# 5. 型チェック
pnpm typecheck
```

### 2.2 本番DBへのスキーマ適用

ローカルで動作確認後、本番DBにスキーマを適用する。

```bash
cd packages/db

# .env.productionに本番Tursoの接続情報を設定（初回のみ）
# TURSO_DATABASE_URL, TURSO_AUTH_TOKENを設定

# 本番DBにスキーマ適用
pnpm db:apply:production
```

## 3. 配信用DBの更新

スキーマ変更後、配信用のDBファイルを更新する必要がある。

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
- **注意**: `dev.db` は変更されない（開発中のスキーマを保持）

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

### 日常的な開発

```bash
# 1. スキーマ変更
cd packages/db
vim schema.sql

# 2. 差分確認
pnpm db:diff

# 3. 適用
pnpm db:apply

# 4. 型再生成
pnpm db:generate

# 5. 開発サーバーで動作確認
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

## まとめ

### プロジェクトルートから実行できる主なコマンド

```bash
# ローカル開発
pnpm db:diff                       # スキーマ差分を確認（dry-run）
pnpm db:apply                      # Atlasでスキーマ適用（dev.dbに対して）
pnpm db:generate                   # kysely-codegenで型生成
pnpm db:replica                    # Tursoから本番データをダウンロード（production-replica.dbへ）
pnpm db:reset                      # production-replica.db → dev.db にコピー

# 本番環境への適用
pnpm db:apply:production           # Tursoにスキーマ適用（Atlas）
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
vim packages/db/schema.sql

# 2. 差分確認
pnpm db:diff

# 3. ローカルで適用
pnpm db:apply

# 4. 型再生成
pnpm db:generate

# 5. 動作確認
pnpm dev

# 6. 本番に適用
pnpm db:apply:production

# 7. 配信用DB更新
pnpm db:replica
pnpm db:upload

# 8. デプロイ
pnpm deploy
```

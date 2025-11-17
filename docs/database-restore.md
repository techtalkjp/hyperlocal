# データベース復元手順

## 概要

開発用データベース（`data/dev.db`）をTursoのリモートデータベースから復元する手順です。

## データベース構成

- **Turso (libsql://hyperlocal-coji.turso.io)**: 本番データベース（クラウド）
- **data/dev.db**: ローカル開発用データベース（Tursoのレプリカ）
- **data/crawl.duckdb**: クローラーが収集した生データ（DuckDB形式）

## 復元手順

### 1. Tursoからデータを同期

```bash
cd apps/web
pnpm make:replica
```

このコマンドは以下を実行します：
- 既存の `data/dev.db` を削除
- Tursoからデータを同期してローカルレプリカを作成

### 2. マイグレーション状態を確認

マイグレーションエラーが発生した場合：

```bash
cd packages/db
pnpm prisma migrate resolve --applied <マイグレーション名>
```

例：
```bash
pnpm prisma migrate resolve --applied 20241026055709_add_admin_user
```

### 3. 最新のマイグレーションを適用

```bash
cd packages/db
pnpm prisma migrate deploy
```

### 4. データ確認

```bash
sqlite3 data/dev.db "SELECT COUNT(*) FROM places; SELECT COUNT(*) FROM area_articles;"
```

## トラブルシューティング

### マイグレーションエラー: "table already exists"

既にテーブルが存在する場合、そのマイグレーションを適用済みとしてマークします：

```bash
cd packages/db
pnpm prisma migrate resolve --applied <マイグレーション名>
pnpm prisma migrate deploy
```

### データが空になった場合

1. `pnpm make:replica` でTursoから再同期
2. 必要に応じてマイグレーションを再適用
3. 記事データ（area_articles）は手動で再生成が必要

## 注意事項

- `make:replica` は既存のローカルDBを**完全に削除**してから復元します
- 記事データ（area_articles）はローカルで生成したもので、Tursoに同期されていない場合は失われます
- 重要な記事データは `upload:db` でTursoにアップロードしておくことを推奨します

## 関連スクリプト

- `apps/web/scripts/make-local-replica.ts`: Tursoから同期
- `apps/web/scripts/upload-db.ts`: TursoへアップロードurlNode
- `packages/db/prisma/migrations/`: マイグレーション履歴

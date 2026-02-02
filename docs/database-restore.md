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
- 既存の `data/production-replica.db` を削除
- Tursoからデータを同期してローカルレプリカを作成

### 2. dev.db にコピー

```bash
pnpm db:reset
```

このコマンドは `production-replica.db` を `dev.db` にコピーします。

### 3. スキーマ差分を確認

```bash
pnpm db:diff
```

差分がある場合は適用：

```bash
pnpm db:migrate
```

### 4. データ確認

```bash
sqlite3 data/dev.db "SELECT COUNT(*) FROM places; SELECT COUNT(*) FROM area_articles;"
```

## トラブルシューティング

### データが空になった場合

1. `pnpm make:replica` でTursoから再同期
2. `pnpm db:reset` で dev.db にコピー
3. 記事データ（area_articles）は手動で再生成が必要

## 注意事項

- `make:replica` は既存の `production-replica.db` を**完全に削除**してから復元します
- `db:reset` は `dev.db` を上書きします
- 記事データ（area_articles）はローカルで生成したもので、Tursoに同期されていない場合は失われます
- 重要な記事データは `upload:db` でR2にアップロードしておくことを推奨します

## 関連ファイル

- `apps/web/scripts/make-local-replica.ts`: Tursoから同期
- `apps/web/scripts/upload-db.ts`: R2へアップロード
- `packages/db/schema.sql`: スキーマ定義
- `packages/db/atlas.hcl`: Atlas設定

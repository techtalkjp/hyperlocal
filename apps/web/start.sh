#!/bin/sh

set -e

# 環境変数から R2 認証情報を取得
R2_PUBLIC_URL="$R2_PUBLIC_URL"
# ダウンロードするオブジェクト
OBJECT_PATH="/db/hyperlocal.db"
DEST_PATH="/app/hyperlocal.db"

curl -o "$DEST_PATH" \
    "${R2_PUBLIC_URL}${OBJECT_PATH}"

echo "SQLite DB downloaded to $DEST_PATH"

pnpm run start --filter @hyperlocal/web

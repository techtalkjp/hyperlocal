#!/bin/sh

set -e

# Database file has already been downloaded during build
# and the DATABASE_URL environment variable is already set

echo "Using pre-downloaded SQLite DB at ${DATABASE_URL}"

pnpm run start --filter @hyperlocal/web

# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.14.0
ARG PNPM_VERSION=10.10.0

# base
FROM node:${NODE_VERSION}-slim AS base

RUN npm i -g "pnpm@${PNPM_VERSION}" turbo && pnpm config set store-dir ~/.pnpm-store


# setup
FROM base AS setup

WORKDIR /app
COPY . .
RUN pnpm turbo prune --scope=@hyperlocal/web --docker


# build
FROM base AS build

WORKDIR /app

# Add R2_PUBLIC_URL as build argument with a default value
ARG R2_PUBLIC_URL=""
# Set it as an environment variable so it's available during build
ENV R2_PUBLIC_URL=${R2_PUBLIC_URL}

COPY --from=setup /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=setup /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=setup /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=setup /app/out/full/ .

# Download database file from R2 before building
RUN apt-get update -qq && apt-get install --no-install-recommends -y curl ca-certificates \
 && mkdir -p /app/db \
 && curl -f -o "/app/db/hyperlocal.db" "${R2_PUBLIC_URL}/db/hyperlocal.db"
ENV DATABASE_URL="file:/app/db/hyperlocal.db"
ENV GA_TRACKING_ID="G-6L2968NBHH"

RUN echo "DATABASE_URL=${DATABASE_URL}" >> apps/web/.env \
 && echo "GA_TRACKING_ID=${GA_TRACKING_ID}" >> apps/web/.env

RUN pnpm run build --filter=@hyperlocal/web \
  && pnpm prune --prod --no-optional


# runner
FROM base AS runner
ENV NODE_ENV=production

RUN apt-get update -qq \
  && apt-get install --no-install-recommends -y openssl openssh-client sqlite3 procps curl ca-certificates unzip vim

WORKDIR /app
COPY --from=build /app .
# Copy the database file from build stage
COPY --from=build /app/db/hyperlocal.db /app/db/hyperlocal.db
ENV DATABASE_URL="file:/app/db/hyperlocal.db"
ENV GA_TRACKING_ID="G-6L2968NBHH"

WORKDIR /app/apps/web

EXPOSE 3000
ENTRYPOINT [ "./start.sh" ]

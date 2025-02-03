# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.11.0
ARG PNPM_VERSION=9.14.1

# base
FROM node:${NODE_VERSION}-slim as base

RUN npm i -g "pnpm@${PNPM_VERSION}" turbo && pnpm config set store-dir ~/.pnpm-store


# setup
FROM base as setup

WORKDIR /app
COPY . .
RUN pnpm turbo prune --scope=@hyperlocal/web --docker


# build
FROM base as build

WORKDIR /app

COPY --from=setup /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=setup /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=setup /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=setup /app/out/full/ .

RUN pnpm run build --filter=@hyperlocal/web \
  && pnpm prune --prod --no-optional


# runner
FROM base as runner
ENV NODE_ENV=production

RUN apt-get update -qq \
  && apt-get install --no-install-recommends -y openssl openssh-client sqlite3 procps curl ca-certificates unzip vim

WORKDIR /app
COPY --from=build /app .
WORKDIR /app/apps/web

EXPOSE 3000
ENTRYPOINT [ "./start.sh" ]

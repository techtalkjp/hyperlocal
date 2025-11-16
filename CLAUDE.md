# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hyperlocal is a monorepo web application for discovering local restaurants and places with multi-language support. It consists of three main applications:
- **Web App**: Public-facing React Router application for browsing places
- **Admin App**: Dashboard for content management with AI integration
- **Crawler**: Data collection service using Crawlee/Playwright

## Essential Commands

### Development

```bash
# Start all development servers
pnpm dev

# Start specific app
pnpm --filter @hyperlocal/web dev
pnpm --filter @hyperlocal/admin dev
pnpm --filter @hyperlocal/crawler dev
```

### Code Quality

```bash
# Run all validation checks
pnpm validate

# Individual checks
pnpm format:fix    # Fix code formatting
pnpm lint          # Run linting
pnpm typecheck     # TypeScript type checking
pnpm test          # Run tests
```

### Building & Deployment

```bash
# Build all packages
pnpm build

# Deploy web app to Fly.io
pnpm deploy
```

### Database Operations (in apps/web)

```bash
pnpm make:replica  # Create local database replica
pnpm upload:db     # Upload database
```

### Crawler Operations (in apps/crawler)

```bash
pnpm crawl         # Run crawler with environment variables
```

## Architecture & Structure

### Monorepo Layout

- **apps/**: Main applications
  - **admin/**: Admin dashboard (Clerk auth, AI features)
  - **web/**: Public website (SSR with React Router v7)
  - **crawler/**: Data collection (Crawlee/Playwright)
- **packages/**: Shared libraries
  - **consts/**: Areas, cities, categories, languages constants
  - **db/**: Database schema (Prisma + Kysely)
  - **google-place-api/**: Google Places API client
  - **gmap-scraper/**: Google Maps scraping utilities

### Key Technologies

- **Framework**: React Router v7 with SSR
- **Database**: SQLite (via Turso) + DuckDB for analytics
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build**: Turbo + Vite
- **Package Manager**: pnpm with workspaces
- **Deployment**: Fly.io (Docker containers)

### Data Model

Core entities:
- **Place**: Restaurant/place data with Google Place ID as identifier
- **PlaceListing**: Categorization by city/area/category
- **LocalizedPlace**: Multi-language content (en, ja, ko, zh-cn, zh-tw)
- **AdminUser**: Admin users with Clerk authentication

### Development Patterns

1. **Type Safety**: All packages use TypeScript. Database types are generated from Prisma schema.
2. **Route Handling**: React Router v7 for both web and admin apps with file-based routing.
3. **Component Library**: Reusable UI components in each app's `app/components/ui/` directory.
4. **Localization**: Built-in support for 5 languages with content stored in LocalizedPlace table.
5. **API Integration**: Google Places API for place data and photos.
6. **useEffect Policy**: Only for external sync (API, WebSocket, browser APIs, timers). Never for derived state, props copying, user actions, or one-time init. Compute during render; handle actions in event handlers. Always add comment explaining what external resource it syncs.

### Important Files

- `packages/db/prisma/schema.prisma`: Database schema definition
- `apps/web/app/routes/`: Web app routes
- `apps/admin/app/routes/`: Admin app routes
- `apps/crawler/src/commands/`: Crawler command implementations

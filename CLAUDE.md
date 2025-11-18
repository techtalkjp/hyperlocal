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

### Pull Request Review

```bash
# View PR review comments
gh api repos/techtalkjp/hyperlocal/issues/[PR_NUMBER]/comments --jq '.[] | select(.user.login == "claude[bot]") | .body' | tail -1

# Example: View latest Claude review for PR #33
gh api repos/techtalkjp/hyperlocal/issues/33/comments --jq '.[] | select(.user.login == "claude[bot]") | .body' | tail -1
```

### Database Operations

```bash
# Local development
pnpm db:migrate                    # Create and apply Prisma migration (to dev.db)
pnpm db:replica                    # Download production data from Turso (to production-replica.db)
pnpm db:reset                      # Copy production-replica.db → dev.db

# Production deployment
pnpm db:migrate:production         # Apply migrations to Turso
pnpm db:fix:checksums              # Fix migration checksums in Turso
pnpm db:upload                     # Upload dev.db to R2 for distribution

# See docs/database-operations.md for detailed workflows
```

### Article Management (in apps/admin)

```bash
# Single article creation
pnpm generate:article --area <area-id> --scene <scene-id> --title <title>
pnpm generate:article --file <article.json>

# Batch import from content/articles/
pnpm import:articles

# List available areas and scenes
pnpm generate:article --list
```

See `docs/article-workflow.md` for detailed article management workflow.

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
7. **Database JSON Handling**: Kysely is configured with `ParseJSONResultsPlugin` (`packages/db/src/index.ts`), which automatically parses JSON fields from the database. Fields like `genres`, `reviews`, `photos`, and `regularOpeningHours` are automatically converted from JSON strings to JavaScript objects/arrays. No manual `JSON.parse()` is needed in query results - simply cast to the appropriate type.
8. **Pre-commit Validation**: **ALWAYS run `pnpm validate` before creating git commits**. This runs all quality checks (format, lint, typecheck, test). Never rely on typecheck alone - always use the full validate command.

### Important Files

- `packages/db/prisma/schema.prisma`: Database schema definition
- `apps/web/app/routes/`: Web app routes
- `apps/admin/app/routes/`: Admin app routes
- `apps/crawler/src/commands/`: Crawler command implementations

## Git Workflow

### CRITICAL: Never Commit Directly to Main

**ALWAYS create a feature branch and pull request. NEVER commit directly to the main branch.**

Workflow:
1. Create a new branch: `git checkout -b feature/description`
2. Make your changes and commit to the feature branch
3. Push the branch: `git push -u origin feature/description`
4. Create a pull request using `gh pr create`
5. After review and approval, merge via GitHub UI or `gh pr merge`

This rule applies to ALL changes, no matter how small. Direct commits to main are strictly prohibited.

## Documentation Policy

When creating investigation reports or analysis documents, save them in `docs/journals/YYYY-MM-DD/` directory with descriptive filenames. Follow these guidelines:

1. **Language**: Write in Japanese for this project
2. **Structure**: Begin with executive summary that presents conclusions first for readers without technical context
3. **Style**: Use natural prose with clear logical flow. Avoid tables, bullet lists, and emojis unless necessary
4. **Clarity**: Write for non-technical stakeholders who lack domain expertise. Explain technical terms when used
5. **Code Examples**: Include code only when absolutely necessary to illustrate a critical point. Prefer prose explanations over code snippets

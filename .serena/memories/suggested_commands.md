# Suggested Commands

## Development
```bash
pnpm dev                              # Start all development servers
pnpm --filter @hyperlocal/web dev     # Start web app only
pnpm --filter @hyperlocal/admin dev   # Start admin app only
pnpm --filter @hyperlocal/crawler dev # Start crawler only
```

## Code Quality (CRITICAL: Run before commits)
```bash
pnpm validate       # Run ALL validation checks (format, lint, typecheck, test)
pnpm format:fix     # Fix code formatting
pnpm lint           # Run linting
pnpm typecheck      # TypeScript type checking
pnpm test           # Run tests
```

## Building & Deployment
```bash
pnpm build          # Build all packages
pnpm deploy         # Deploy web app to Fly.io
```

## Database Operations
```bash
# Local development
pnpm db:migrate                    # Create and apply Prisma migration (to dev.db)
pnpm db:replica                    # Download production data from Turso
pnpm db:reset                      # Copy production-replica.db → dev.db

# Production
pnpm db:migrate:production         # Apply migrations to Turso
pnpm db:fix:checksums              # Fix migration checksums in Turso
pnpm db:upload                     # Upload dev.db to R2
```

## Article Management (in apps/admin)
```bash
pnpm generate:article --area <area-id> --scene <scene-id> --title <title>
pnpm generate:article --file <article.json>
pnpm import:articles               # Batch import from content/articles/
pnpm generate:article --list       # List available areas and scenes
```

## Crawler Operations (in apps/crawler)
```bash
pnpm crawl                         # Run crawler
```

## System Utilities (Darwin/macOS)
- `git`, `ls`, `cd`, `grep`, `find` work normally
- Use `open` to open files/folders in Finder
- Use `pbcopy`/`pbpaste` for clipboard operations

# Hyperlocal Project Overview

## Purpose
Hyperlocal is a web application for discovering local restaurants and places with multi-language support (en, ja, ko, zh-cn, zh-tw).

## Repository Structure
This is a monorepo managed with pnpm workspaces and Turborepo.

### Apps
- **apps/web**: Public-facing React Router v7 SSR application for browsing places
- **apps/admin**: Admin dashboard with Clerk authentication and AI integration
- **apps/crawler**: Data collection service using Crawlee/Playwright

### Packages
- **packages/consts**: Areas, cities, categories, languages constants
- **packages/db**: Database schema (Prisma + Kysely) with SQLite
- **packages/google-place-api**: Google Places API client
- **packages/gmap-scraper**: Google Maps scraping utilities

## Tech Stack
- **Framework**: React Router v7 with SSR
- **Database**: SQLite (via Turso) + Kysely as query builder
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tools**: Turborepo + Vite
- **Package Manager**: pnpm (v10.17.0)
- **Deployment**: Fly.io (Docker containers)
- **Authentication**: Clerk (admin app only)
- **AI Integration**: Anthropic SDK, Vercel AI SDK

## Data Model (Core Entities)
- **Place**: Restaurant/place data with Google Place ID as identifier
- **PlaceListing**: Categorization by city/area/category
- **LocalizedPlace**: Multi-language content
- **AreaArticle**: MDX articles about areas
- **AdminUser**: Admin users with Clerk authentication

## Database
- Uses Prisma for schema definition and migrations
- Uses Kysely for type-safe SQL queries
- `ParseJSONResultsPlugin` auto-parses JSON fields (genres, reviews, photos, regularOpeningHours)

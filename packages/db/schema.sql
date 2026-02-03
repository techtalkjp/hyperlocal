-- Hyperlocal Database Schema
-- Managed by Atlas (declarative)

-- better-auth core tables
CREATE TABLE `user` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL UNIQUE,
  `email_verified` integer NOT NULL DEFAULT 0,
  `image` text,
  `role` text DEFAULT 'user',
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `session` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `token` text NOT NULL UNIQUE,
  `expires_at` text NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `account` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `user`(`id`) ON DELETE CASCADE,
  `account_id` text NOT NULL,
  `provider_id` text NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `access_token_expires_at` text,
  `refresh_token_expires_at` text,
  `scope` text,
  `id_token` text,
  `password` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `verification` (
  `id` text PRIMARY KEY NOT NULL,
  `identifier` text NOT NULL,
  `value` text NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX `session_user_id_idx` ON `session`(`user_id`);
CREATE INDEX `session_token_idx` ON `session`(`token`);
CREATE INDEX `account_user_id_idx` ON `account`(`user_id`);
CREATE INDEX `account_provider_idx` ON `account`(`provider_id`, `account_id`);

-- Create "places" table
CREATE TABLE `places` (
  `id` text NOT NULL,
  `categories` text NOT NULL DEFAULT '[]',
  `genres` text NOT NULL DEFAULT '[]',
  `display_name` text NOT NULL,
  `rating` real NOT NULL,
  `user_rating_count` integer NOT NULL,
  `latitude` real NOT NULL,
  `longitude` real NOT NULL,
  `google_maps_uri` text NOT NULL,
  `source_uri` text NULL,
  `price_level` text NULL,
  `regular_opening_hours` text NULL,
  `reviews` text NOT NULL,
  `photos` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`)
);

-- Create "place_listings" table
CREATE TABLE `place_listings` (
  `city_id` text NOT NULL,
  `area_id` text NOT NULL,
  `category_id` text NOT NULL,
  `ranking_type` text NOT NULL,
  `place_id` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`city_id`, `area_id`, `category_id`, `ranking_type`, `place_id`),
  CONSTRAINT `place_listings_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Create "localized_places" table
CREATE TABLE `localized_places` (
  `city_id` text NOT NULL,
  `area_id` text NOT NULL,
  `category_id` text NOT NULL,
  `ranking_type` text NOT NULL,
  `place_id` text NOT NULL,
  `language` text NOT NULL,
  `genres` text NOT NULL DEFAULT '[]',
  `display_name` text NOT NULL,
  `original_display_name` text NOT NULL,
  `rating` real NOT NULL,
  `user_rating_count` integer NOT NULL,
  `latitude` real NOT NULL,
  `longitude` real NOT NULL,
  `google_maps_uri` text NOT NULL,
  `source_uri` text NULL,
  `price_level` text NULL,
  `regular_opening_hours` text NULL,
  `reviews` text NOT NULL,
  `photos` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`city_id`, `area_id`, `category_id`, `ranking_type`, `place_id`, `language`),
  CONSTRAINT `localized_places_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE INDEX `localized_places_place_id_language_idx` ON `localized_places` (`place_id`, `language`);

-- Create "area_articles" table
CREATE TABLE `area_articles` (
  `id` text NOT NULL,
  `city_id` text NOT NULL,
  `area_id` text NOT NULL,
  `scene_id` text NOT NULL,
  `language` text NOT NULL,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `compiled_code` text NOT NULL,
  `status` text NOT NULL DEFAULT 'draft',
  `metadata` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE UNIQUE INDEX `area_articles_unique` ON `area_articles` (`city_id`, `area_id`, `scene_id`, `language`);

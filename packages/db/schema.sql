-- Hyperlocal Database Schema
-- Managed by Atlas (declarative)

-- Create "admin_users" table
CREATE TABLE `admin_users` (
  `id` text NOT NULL,
  `email` text NOT NULL,
  `display_name` text NOT NULL,
  `picture_url` text NULL,
  `locale` text NOT NULL,
  `role` text NOT NULL DEFAULT 'user',
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`)
);
CREATE UNIQUE INDEX `admin_users_email_key` ON `admin_users` (`email`);

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

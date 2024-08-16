CREATE TABLE `google_places` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`types` text NOT NULL,
	`primary_type` text NOT NULL,
	`rating` real NOT NULL,
	`user_rating_count` real NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`display_name` text NOT NULL,
	`raw` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `google_places_areas` (
	`google_place_id` text NOT NULL,
	`area_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`google_place_id`) REFERENCES `google_places`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
/*
 SQLite does not support "Set not null to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
/*
 SQLite does not support "Changing existing column type" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
CREATE UNIQUE INDEX `google_places_areas_google_place_id_area_id_unique` ON `google_places_areas` (`google_place_id`,`area_id`);
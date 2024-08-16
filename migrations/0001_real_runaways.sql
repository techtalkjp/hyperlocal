CREATE TABLE `google_places` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`types` text NOT NULL,
	`formatted_address` text NOT NULL,
	`short_formatted_address` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`raiting` real,
	`google_maps_uri` text,
	`regular_opening_hours` text,
	`business_status` text,
	`price_level` text,
	`user_rating_count` real,
	`display_name` text NOT NULL,
	`primary_type_display_name` text NOT NULL,
	`primary_type` text NOT NULL,
	`editorial_summary` text,
	`reviews` text,
	`photos` text
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
*/
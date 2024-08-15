CREATE TABLE `areas` (
	`id` text,
	`name` text NOT NULL,
	`longitude` numeric NOT NULL,
	`latitude` numeric NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

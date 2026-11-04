CREATE TABLE "leaderboard_entries" (
	"profile_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"suffix" integer NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);

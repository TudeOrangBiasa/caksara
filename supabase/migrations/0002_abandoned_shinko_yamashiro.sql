ALTER TABLE "quiz_calls" ADD COLUMN "window_hour" timestamp;--> statement-breakpoint
CREATE INDEX "quiz_calls_profile_window_idx" ON "quiz_calls" USING btree ("profile_id","window_hour");
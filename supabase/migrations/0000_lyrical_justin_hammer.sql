CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"question_idx" integer NOT NULL,
	"aksara_id" text,
	"correct" boolean NOT NULL,
	"answered_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kb_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"source" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"embedding" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"theme" text,
	"order" integer NOT NULL,
	"prereq_id" text
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"is_anon" boolean DEFAULT true NOT NULL,
	"name" text NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" text,
	"hearts" integer DEFAULT 5 NOT NULL,
	"hearts_refilled_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_calls" (
	"profile_id" text NOT NULL,
	"called_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"module_id" text NOT NULL,
	"questions" jsonb NOT NULL,
	"status" text DEFAULT 'in_progress',
	"score" integer DEFAULT 0,
	"current_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_aksara_progress" (
	"profile_id" text NOT NULL,
	"aksara_id" text NOT NULL,
	"correct_count" integer DEFAULT 0,
	"total_count" integer DEFAULT 0,
	"mastery" text DEFAULT 'belum',
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_aksara_progress_profile_id_aksara_id_pk" PRIMARY KEY("profile_id","aksara_id")
);

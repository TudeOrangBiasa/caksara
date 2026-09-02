import {
  pgTable,
  primaryKey,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

// profiles — id = auth.uid() anon atau asli
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  isAnon: boolean("is_anon").default(true).notNull(),
  name: text("name").notNull(),
  xp: integer("xp").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastActiveDate: text("last_active_date"),
  hearts: integer("hearts").default(5).notNull(),
  heartsRefilledAt: timestamp("hearts_refilled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  theme: text("theme"),
  order: integer('"order"').notNull(),
  prereqId: text("prereq_id"),
});

export const kbEntries = pgTable("kb_entries", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  source: text("source").notNull(),
  level: integer("level").default(1).notNull(),
  embedding: jsonb("embedding"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id").notNull(),
  moduleId: text("module_id").notNull(),
  questions: jsonb("questions").notNull(),
  status: text("status").default("in_progress"),
  score: integer("score").default(0),
  currentIndex: integer("current_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  questionIdx: integer("question_idx").notNull(),
  aksaraId: text("aksara_id"),
  correct: boolean("correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const userAksaraProgress = pgTable(
  "user_aksara_progress",
  {
    profileId: text("profile_id").notNull(),
    aksaraId: text("aksara_id").notNull(),
    correctCount: integer("correct_count").default(0),
    totalCount: integer("total_count").default(0),
    mastery: text("mastery").default("belum"),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.profileId, t.aksaraId] }),
  }),
);

export const quizCalls = pgTable("quiz_calls", {
  profileId: text("profile_id").notNull(),
  calledAt: timestamp("called_at").defaultNow(),
});

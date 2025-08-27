import { z } from "zod";
import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export const upsertUserSchema = insertUserSchema.omit({ createdAt: true, updatedAt: true });

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

// MoodVibe specific schemas
export const moodRequestSchema = z.object({
  mood: z.string().min(1, "Mood cannot be empty").max(500, "Mood is too long"),
});

export const songSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  album: z.string(),
  spotifyUrl: z.string(),
  imageUrl: z.string().optional(),
  previewUrl: z.string().optional(),
});

export const recommendationsResponseSchema = z.object({
  detectedMood: z.string(),
  songs: z.array(songSchema),
});

export type MoodRequest = z.infer<typeof moodRequestSchema>;
export type Song = z.infer<typeof songSchema>;
export type RecommendationsResponse = z.infer<typeof recommendationsResponseSchema>;

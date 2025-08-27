import { z } from "zod";

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

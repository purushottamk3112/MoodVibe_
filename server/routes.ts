import type { Express } from "express";
import { createServer, type Server } from "http";
import { moodRequestSchema, recommendationsResponseSchema } from "@shared/schema";
import { analyzeMood } from "./services/gemini";
import { spotifyService } from "./services/spotify";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    try {
      // Validate request body
      const validationResult = moodRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request",
          errors: validationResult.error.errors,
        });
      }

      const { mood } = validationResult.data;

      // Step 1: Analyze mood using Gemini API
      const moodAnalysis = await analyzeMood(mood);

      // Step 2: Search for tracks using Spotify API
      const songs = await spotifyService.searchTracks(moodAnalysis.keywords);

      // Step 3: Return recommendations
      const response = {
        detectedMood: moodAnalysis.genres.join(", "),
        songs,
      };

      res.json(response);
    } catch (error) {
      console.error("Error in /api/recommendations:", error);
      res.status(500).json({
        message: "Failed to get recommendations. Please try again.",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

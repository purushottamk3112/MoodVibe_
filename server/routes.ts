import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "./config/passport";
import { moodRequestSchema } from "@shared/schema";
import { analyzeMood } from "./services/gemini";
import { spotifyService } from "./services/spotify";
import { AuthService } from "./services/auth";
import { authenticateToken, optionalAuth } from "./middleware/auth";
import { z } from "zod";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  
  // Register with email/password
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors,
        });
      }

      const { email, name, password } = validationResult.data;
      const result = await AuthService.registerUser(email, name, password);

      res.json({
        message: "Registration successful",
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({
        message: error.message || "Registration failed",
      });
    }
  });

  // Login with email/password
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors,
        });
      }

      const { email, password } = validationResult.data;
      const result = await AuthService.loginUser(email, password);

      res.json({
        message: "Login successful",
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(401).json({
        message: error.message || "Login failed",
      });
    }
  });

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  // app.get(
  //   "/api/auth/google/callback",
  //   passport.authenticate("google", { session: false }),
  //   (req: any, res) => {
  //     try {
  //       const { user, token } = req.user;
  //       // Redirect to frontend with token
  //       res.redirect(`/?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  //     } catch (error) {
  //       console.error("Google callback error:", error);
  //       res.redirect("/?error=auth_failed");
  //     }
  //   }
  // );
  //modified code for detecting error,we can chevkk it later 

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req: any, res) => {
      try {
        console.log("Google callback reached, req.user =", req.user);
        const { user, token } = req.user ?? {};
  
        if (!user || !token) {
          console.error("Missing user or token after Google auth");
          return res.status(400).json({ message: "Invalid profile" });
        }
  
        res.redirect(
          `/?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
        );
      } catch (error: any) {
        console.error("Google callback error:", error);
        res.status(400).json({ message: error.message || "Invalid URL" });
      }
    }
  );





  // Get current user
  app.get("/api/auth/me", authenticateToken, (req, res) => {
    res.json({ user: req.user });
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  // Main recommendation endpoint (with optional auth)
  app.post("/api/recommendations", optionalAuth, async (req, res) => {
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
        user: req.user || null, // Include user info if authenticated
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
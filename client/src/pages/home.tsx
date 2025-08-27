import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Music, Heart, Search, Sun, Moon, LogOut, User } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/useAuth";
import { SongCard } from "@/components/song-card";
import { LoadingState } from "@/components/loading-state";
import { apiRequest } from "@/lib/queryClient";
import { RecommendationsResponse } from "@/types/music";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [moodInput, setMoodInput] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const recommendationsMutation = useMutation({
    mutationFn: async (mood: string): Promise<RecommendationsResponse> => {
      const response = await apiRequest("POST", "/api/recommendations", { mood });
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data);
      toast({
        title: "Recommendations found!",
        description: `Found ${data.songs.length} songs for your ${data.detectedMood} mood.`,
      });
    },
    onError: (error) => {
      console.error("Failed to get recommendations:", error);
      toast({
        title: "Something went wrong",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moodInput.trim()) {
      recommendationsMutation.mutate(moodInput.trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="p-6 flex justify-between items-center"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <Music className="text-primary-foreground w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            MoodVibe
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                  data-testid="user-avatar"
                />
              ) : (
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.firstName || user.email}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-12 h-6 bg-secondary rounded-full shadow-inner transition-colors duration-300"
            data-testid="theme-toggle"
          >
            <motion.div
              className="absolute w-5 h-5 bg-primary rounded-full top-0.5 shadow-md"
              animate={{
                x: theme === "dark" ? 24 : 2,
              }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            />
            <Sun className="absolute left-1.5 top-1 w-3 h-3 text-muted-foreground" />
            <Moon className="absolute right-1.5 top-1 w-3 h-3 text-muted-foreground" />
          </motion.button>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-all duration-300 flex items-center space-x-2"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.68, -0.55, 0.265, 1.55],
            delay: 0.2,
          }}
          className="w-full max-w-2xl mx-auto text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Discover Music for{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Mood
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
              Tell us how you're feeling, and we'll find the perfect soundtrack
              for your moment
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="How are you feeling today?"
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value)}
                disabled={recommendationsMutation.isPending}
                className="w-full px-6 py-4 text-lg rounded-2xl glass-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 disabled:opacity-50"
                data-testid="mood-input"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Heart className="text-primary w-6 h-6" />
                </motion.div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={!moodInput.trim() || recommendationsMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto px-12 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              data-testid="submit-button"
            >
              <Search className="w-5 h-5" />
              <span>
                {recommendationsMutation.isPending ? "Finding..." : "Get My Vibe"}
              </span>
            </motion.button>
          </form>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {recommendationsMutation.isPending && <LoadingState />}
        </AnimatePresence>

        {/* Recommendations */}
        <AnimatePresence mode="wait">
          {recommendations && !recommendationsMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-6xl mx-auto mt-12"
              data-testid="recommendations-section"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-foreground mb-2">
                  Your Mood Playlist
                </h3>
                <p className="text-muted-foreground">
                  Based on your current vibe:{" "}
                  <span className="text-primary font-medium" data-testid="detected-mood">
                    {recommendations.detectedMood}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.songs.map((song, index) => (
                  <SongCard key={song.id} song={song} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center border-t border-border/50">
        <p className="text-muted-foreground text-sm">
          Powered by{" "}
          <span className="text-primary font-medium">Spotify</span> &{" "}
          <span className="text-primary font-medium">Google Gemini</span>
        </p>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Music, Heart, Search, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { SongCard } from "@/components/song-card";
import { LoadingState } from "@/components/loading-state";
import { apiRequest } from "@/lib/queryClient";
import { RecommendationsResponse } from "@/types/music";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [moodInput, setMoodInput] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

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
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 glass-card rounded-full hover:bg-accent/10 transition-all duration-300"
            data-testid="theme-toggle"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-foreground" />
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Discover Music That{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Matches Your Mood
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Tell us how you're feeling, and we'll find the perfect soundtrack for your moment using AI-powered music recommendations.
          </p>
        </motion.div>

        {/* Mood Input Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-2xl mx-auto mb-12"
          data-testid="mood-form"
        >
          <div className="glass-card rounded-2xl p-8 shadow-2xl">
            <div className="space-y-6">
              <div>
                <label htmlFor="mood" className="block text-sm font-medium text-foreground mb-2">
                  How are you feeling today?
                </label>
                <textarea
                  id="mood"
                  value={moodInput}
                  onChange={(e) => setMoodInput(e.target.value)}
                  placeholder="I'm feeling nostalgic about summer nights... or maybe energetic and ready to conquer the world!"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none"
                  maxLength={500}
                  data-testid="mood-input"
                />
                <div className="text-right mt-2">
                  <span className="text-sm text-muted-foreground">
                    {moodInput.length}/500
                  </span>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={!moodInput.trim() || recommendationsMutation.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                data-testid="submit-button"
              >
                <Search className="w-5 h-5" />
                <span>
                  {recommendationsMutation.isPending
                    ? "Finding Your Music..."
                    : "Get My Soundtrack"}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.form>

        {/* Loading State */}
        <AnimatePresence>
          {recommendationsMutation.isPending && <LoadingState />}
        </AnimatePresence>

        {/* Recommendations */}
        <AnimatePresence>
          {recommendations && !recommendationsMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-7xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-12"
              >
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  Your Perfect Soundtrack
                </h3>
                <p className="text-xl text-muted-foreground">
                  We detected a{" "}
                  <span className="font-semibold text-primary">
                    {recommendations.detectedMood}
                  </span>{" "}
                  mood. Here are songs that match your vibe:
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.songs.map((song, index) => (
                  <SongCard key={song.id} song={song} index={index} />
                ))}
              </div>

              {/* Try Again Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center mt-16"
              >
                <motion.button
                  onClick={() => {
                    setRecommendations(null);
                    setMoodInput("");
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 glass-card rounded-xl text-foreground font-medium transition-all duration-300 hover:bg-accent/10"
                  data-testid="try-again-button"
                >
                  Try Different Mood
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
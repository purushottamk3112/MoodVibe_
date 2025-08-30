import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Music, Heart, Search, Sun, Moon, Sparkles, Zap, History, User, LogOut, LogIn } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/auth-context";
import { useSearchHistory } from "@/hooks/use-search-history";
import { SongCard } from "@/components/song-card";
import { LoadingState } from "@/components/loading-state";
import { SearchSuggestionDropdown } from "@/components/search-suggestion-dropdown";
import { AuthModal } from "@/components/auth-modal";
import { apiRequest } from "@/lib/queryClient";
import { RecommendationsResponse } from "@/types/music";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [moodInput, setMoodInput] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  } = useSearchHistory();

  // Handle click outside to close suggestions and user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recommendationsMutation = useMutation({
    mutationFn: async (mood: string): Promise<RecommendationsResponse> => {
      const token = localStorage.getItem("auth_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers,
        body: JSON.stringify({ mood }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data);
      // Add to search history
      addToHistory(moodInput.trim(), data.detectedMood);
      toast({
        title: "🎵 Recommendations found!",
        description: `Found ${data.songs.length} perfect songs for your ${data.detectedMood} mood.`,
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
      setShowSuggestions(false);
      setIsSearchFocused(false);
      recommendationsMutation.mutate(moodInput.trim());
    }
  };

  const handleSearchSelect = (query: string) => {
    setMoodInput(query);
    setShowSuggestions(false);
    setIsSearchFocused(false);
    // Auto-submit the selected query
    setTimeout(() => {
      recommendationsMutation.mutate(query.trim());
    }, 100);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      if (!searchContainerRef.current?.contains(document.activeElement)) {
        setIsSearchFocused(false);
      }
    }, 150);
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

          {/* User Authentication */}
          {authLoading ? (
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3 p-2 glass-card rounded-full hover:bg-accent/10 transition-all duration-300"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden sm:block text-foreground font-medium">
                  {user.name}
                </span>
              </motion.button>

              {/* User Menu Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 glass-card rounded-xl border border-border/50 shadow-2xl z-50 min-w-48"
                  >
                    <div className="p-4 border-b border-border/30">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                          {user.provider === "google" ? "Google" : "Email"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        toast({
                          title: "Goodbye! 👋",
                          description: "You've been logged out successfully.",
                        });
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-accent/20 transition-colors flex items-center space-x-2 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={() => setShowAuthModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium rounded-full hover:shadow-lg transition-all duration-300"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block mb-8"
          >
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-r from-primary via-accent to-primary rounded-3xl flex items-center justify-center shadow-2xl">
              <Heart className="w-12 h-12 text-white relative z-10" />
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl"
              />
            </div>
          </motion.div>
          
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover Music That{" "}
            <motion.span 
              className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-300% animate-pulse"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Matches Your Soul
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Tell us how you're feeling, and we'll craft the perfect soundtrack for your moment using ✨ AI-powered music discovery.
          </motion.p>
          
          <motion.div
            className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-full">
              <History className="w-4 h-4" />
              <span>Search History</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Mood Input Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-3xl mx-auto mb-16"
          data-testid="mood-form"
        >
          <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl border border-border/50">
            <div className="space-y-8">
              <div className="text-center">
                <motion.h3 
                  className="text-2xl font-bold text-foreground mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  🎭 What's Your Vibe Today?
                </motion.h3>
                <p className="text-muted-foreground">
                  Describe your mood, emotions, or the atmosphere you're looking for
                </p>
              </div>
              
              <div className="relative" ref={searchContainerRef}>
                <label htmlFor="mood" className="block text-sm font-semibold text-foreground mb-3">
                  Your Mood Description
                </label>
                <div className="relative">
                  <motion.div
                    className={`relative rounded-xl transition-all duration-300 ${
                      isSearchFocused 
                        ? 'ring-2 ring-primary/50 shadow-lg shadow-primary/10' 
                        : 'hover:shadow-md'
                    }`}
                    whileFocus={{ scale: 1.01 }}
                  >
                    <textarea
                      ref={searchInputRef}
                      id="mood"
                      value={moodInput}
                      onChange={(e) => setMoodInput(e.target.value)}
                      onFocus={handleSearchFocus}
                      onBlur={handleSearchBlur}
                      placeholder="I'm feeling nostalgic about summer nights... or maybe energetic and ready to conquer the world! 🌟"
                      rows={4}
                      className={`w-full px-6 py-4 rounded-xl border-2 transition-all duration-300 resize-none text-lg leading-relaxed ${
                        theme === 'dark'
                          ? 'border-border bg-card/80 text-foreground placeholder:text-muted-foreground focus:bg-card'
                          : 'border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus:bg-background'
                      } focus:outline-none focus:border-primary/50 backdrop-blur-sm`}
                      maxLength={500}
                      data-testid="mood-input"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center space-x-3">
                      <span className={`text-sm transition-colors ${
                        moodInput.length > 450 ? 'text-warning' : 'text-muted-foreground'
                      }`}>
                        {moodInput.length}/500
                      </span>
                      {moodInput.length > 0 && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      )}
                    </div>
                  </motion.div>
                  
                  <SearchSuggestionDropdown
                    isOpen={showSuggestions && (searchHistory.length > 0 || moodInput.length > 0)}
                    searchHistory={searchHistory}
                    onSelect={handleSearchSelect}
                    onRemove={removeFromHistory}
                    onClear={clearHistory}
                    searchQuery={moodInput}
                  />
                </div>
              </div>

              <motion.div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  type="submit"
                  disabled={!moodInput.trim() || recommendationsMutation.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-8 py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    !moodInput.trim() || recommendationsMutation.isPending
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-xl hover:shadow-primary/25'
                  }`}
                  data-testid="submit-button"
                >
                  <Search className={`w-6 h-6 ${
                    recommendationsMutation.isPending ? 'animate-pulse' : ''
                  }`} />
                  <span>
                    {recommendationsMutation.isPending
                      ? "🎵 Finding Your Perfect Soundtrack..."
                      : "✨ Discover My Music"}
                  </span>
                </motion.button>
                
                {searchHistory.length > 0 && (
                  <motion.button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-5 rounded-xl border-2 border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center justify-center space-x-2 glass-card"
                    title="View search history"
                  >
                    <History className="w-5 h-5" />
                    <span className="hidden sm:inline">History</span>
                  </motion.button>
                )}
              </motion.div>
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

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
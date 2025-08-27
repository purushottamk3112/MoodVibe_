import { motion } from "framer-motion";
import { Music, Heart, LogIn, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  const handleLogin = () => {
    window.location.href = "/api/login";
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
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
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
          <div className="space-y-6">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-xl"
            >
              <Heart className="text-primary-foreground w-12 h-12" />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MoodVibe
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Discover personalized music recommendations based on your current mood. 
              Let AI understand your feelings and find the perfect soundtrack for every moment.
            </p>
          </div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto px-12 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
              data-testid="login-button"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In to Get Started</span>
            </motion.button>

            <div className="text-sm text-muted-foreground">
              Sign in with your account to start discovering music that matches your mood
            </div>
          </motion.div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">AI Mood Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI understands your emotions and finds matching music genres
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Spotify Integration</h3>
            <p className="text-sm text-muted-foreground">
              Access millions of tracks with direct links to open in Spotify
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto">
              <Sun className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Beautiful Design</h3>
            <p className="text-sm text-muted-foreground">
              Elegant interface with smooth animations and light/dark themes
            </p>
          </div>
        </motion.div>
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
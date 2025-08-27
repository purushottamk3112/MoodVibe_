import { motion } from "framer-motion";

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto mt-12 text-center"
      data-testid="loading-state"
    >
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <motion.div
            className="w-3 h-3 bg-primary rounded-full"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-3 h-3 bg-primary rounded-full"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <motion.div
            className="w-3 h-3 bg-primary rounded-full"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </div>
        <p className="text-muted-foreground">
          Analyzing your mood and finding perfect tracks...
        </p>
      </div>
    </motion.div>
  );
}

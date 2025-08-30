import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Trash2 } from "lucide-react";
import { SearchHistoryItem } from "@/hooks/use-search-history";

interface SearchSuggestionDropdownProps {
  isOpen: boolean;
  searchHistory: SearchHistoryItem[];
  onSelect: (query: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  searchQuery: string;
}

export function SearchSuggestionDropdown({
  isOpen,
  searchHistory,
  onSelect,
  onRemove,
  onClear,
  searchQuery,
}: SearchSuggestionDropdownProps) {
  // Filter history based on current search query
  const filteredHistory = searchHistory.filter((item) =>
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen || (filteredHistory.length === 0 && searchQuery.length === 0)) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl border border-border/50 shadow-2xl z-50 overflow-hidden"
      >
        {filteredHistory.length > 0 && (
          <>
            <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Recent Searches
                </span>
              </div>
              {searchHistory.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                  title="Clear all history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <button
                    onClick={() => onSelect(item.query)}
                    className="w-full px-4 py-3 text-left hover:bg-accent/20 transition-colors flex items-start space-x-3 border-b border-border/20 last:border-b-0"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground font-medium line-clamp-2 mb-1">
                        {item.query}
                      </div>
                      {item.detectedMood && (
                        <div className="text-xs text-muted-foreground">
                          Mood: {item.detectedMood}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    title="Remove from history"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
import { useState, useEffect } from "react";

const SEARCH_HISTORY_KEY = "moodvibe-search-history";
const MAX_HISTORY_ITEMS = 5;

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  detectedMood?: string;
}

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSearchHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  }, [searchHistory]);

  const addToHistory = (query: string, detectedMood?: string) => {
    const newItem: SearchHistoryItem = {
      id: crypto.randomUUID(),
      query: query.trim(),
      timestamp: Date.now(),
      detectedMood,
    };

    setSearchHistory((prev) => {
      // Remove any existing entry with the same query (case-insensitive)
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== query.toLowerCase()
      );
      
      // Add the new item to the beginning and limit to MAX_HISTORY_ITEMS
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const removeFromHistory = (id: string) => {
    setSearchHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const getRecentQueries = () => {
    return searchHistory.map((item) => item.query);
  };

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getRecentQueries,
  };
}
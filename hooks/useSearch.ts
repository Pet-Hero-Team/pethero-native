import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { mockResults } from "../data/mockResults";

interface SearchItem {
  id: string;
  title: string;
}

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  filteredResults: SearchItem[];
  showRecommendations: boolean;
  handleSearchInputChange: (text: string) => void;
  handleClearSearch: () => void;
}

export const useSearch = (initialQuery: string = ""): UseSearchReturn => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isTyping, setIsTyping] = useState(false);

  const fuse = useMemo(() => new Fuse(mockResults, { keys: ["title"], threshold: 0.4, includeScore: true }), []);

  const filteredResults = searchQuery.trim()
    ? fuse.search(searchQuery.trim()).map((result) => result.item as SearchItem)
    : [];

  const showRecommendations = isTyping && filteredResults.length > 0;

  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    setIsTyping(!!text.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsTyping(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    isTyping,
    setIsTyping,
    filteredResults,
    showRecommendations,
    handleSearchInputChange,
    handleClearSearch,
  };
};

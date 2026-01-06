import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X, Loader2 } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  category?: string;
}

interface ProfessionalSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ProfessionalSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Search events, venues, tags...",
  className
}: ProfessionalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentEventSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Fetch trending searches from API
    const fetchTrendingSearches = async () => {
      try {
        const response = await fetch('/api/search/trending');
        const data = await response.json();
        setTrendingSearches(data.trendingSearches || []);
      } catch (error) {
        console.error('Failed to fetch trending searches:', error);
        setTrendingSearches([]);
      }
    };
    
    fetchTrendingSearches();
  }, []);

  // Save search to history
  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentEventSearches', JSON.stringify(updated));
  };

  // Fetch suggestions from API
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    fetchSuggestions(newValue);
    setHighlightedIndex(-1);
  };

  // Handle search
  const handleSearch = (query: string = value) => {
    if (!query.trim()) return;
    
    saveSearch(query);
    onSearch(query);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length + recentSearches.length + trendingSearches.length - 1 
            ? prev + 1 
            : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const allItems = [
            ...recentSearches.map(s => ({ text: s, type: 'recent' as const })),
            ...trendingSearches.map(s => ({ text: s, type: 'trending' as const })),
            ...suggestions
          ];
          const selectedItem = allItems[highlightedIndex];
          if (selectedItem) {
            onChange(selectedItem.text);
            handleSearch(selectedItem.text);
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion | string) => {
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
    onChange(text);
    handleSearch(text);
  };

  // Clear search
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Get all items for keyboard navigation
  const getAllItems = () => {
    const items: Array<{ text: string; type: string; category?: string }> = [];
    
    recentSearches.forEach(search => 
      items.push({ text: search, type: 'recent' })
    );
    
    trendingSearches.forEach(search => 
      items.push({ text: search, type: 'trending' })
    );
    
    suggestions.forEach(suggestion => 
      items.push(suggestion)
    );
    
    return items;
  };

  const allItems = getAllItems();

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          className={cn(
            "pl-12 pr-12 h-14 text-base border-gray-200 focus:border-green-500 focus:ring-green-500",
            isOpen && "ring-2 ring-green-500 border-green-500"
          )}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={(e) => {
            // Delay closing to allow click on suggestions
            setTimeout(() => {
              if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
                setIsOpen(false);
              }
            }, 150);
          }}
        />
        
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        {isLoading && (
          <Loader2 className="absolute right-12 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && !value && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Recent Searches</span>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={search}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 flex items-center gap-2",
                      highlightedIndex === index && "bg-gray-100"
                    )}
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {trendingSearches.length > 0 && !value && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Trending</span>
              </div>
              <div className="space-y-1">
                {trendingSearches.map((search, index) => (
                  <button
                    key={search}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 flex items-center gap-2",
                      highlightedIndex === recentSearches.length + index && "bg-gray-100"
                    )}
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <TrendingUp className="h-3 w-3 text-orange-400" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Suggestions</span>
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 flex items-center gap-2 justify-between",
                      highlightedIndex === recentSearches.length + trendingSearches.length + index && "bg-gray-100"
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-700">{suggestion.text}</span>
                    </div>
                    {suggestion.category && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {value && !isLoading && suggestions.length === 0 && recentSearches.length === 0 && trendingSearches.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No suggestions found. Try searching for events, venues, or tags.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

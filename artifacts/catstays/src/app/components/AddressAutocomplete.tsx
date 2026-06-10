import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';

interface NominatimResult {
  place_id: number;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

function formatAddress(result: NominatimResult): string {
  const a = result.address;
  const parts: string[] = [];

  if (a.house_number && a.road) {
    parts.push(`${a.house_number} ${a.road}`);
  } else if (a.road) {
    parts.push(a.road);
  }

  const city = a.city || a.town || a.village || a.suburb || a.neighbourhood;
  if (city) parts.push(city);

  if (a.state) parts.push(a.state);
  if (a.postcode) parts.push(a.postcode);
  if (a.country) parts.push(a.country);

  return parts.length > 0 ? parts.join(', ') : result.display_name;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Start typing your address...',
  className = '',
  id,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const suppressFetchRef = useRef(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (suppressFetchRef.current) {
        suppressFetchRef.current = false;
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          limit: '6',
          addressdetails: '1',
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: abortRef.current.signal,
            headers: { 'Accept-Language': 'en' },
          }
        );
        if (!res.ok) throw new Error('Search request failed');
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setIsOpen(data.length > 0);
        setHighlightedIndex(-1);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: NominatimResult) => {
    const formatted = formatAddress(result);
    suppressFetchRef.current = true;
    setQuery(formatted);
    onChange(formatted);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        type="text"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      />

      {isLoading && (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7DAF7B] border-t-transparent" />
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {suggestions.map((result, i) => (
            <li
              key={result.place_id}
              role="option"
              aria-selected={i === highlightedIndex}
              onMouseDown={e => {
                e.preventDefault();
                handleSelect(result);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`cursor-pointer px-4 py-3 text-sm transition-colors ${
                i === highlightedIndex
                  ? 'bg-[#F0F7EF] text-[#2d3e2f]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {formatAddress(result)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

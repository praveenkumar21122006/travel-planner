import { useCallback, useEffect, useRef, useState } from "react";
import { Globe2, Loader2, MapPin, Search } from "lucide-react";

import type { CitySuggestion } from "../types";
import { api } from "../services/api";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

interface CitySearchProps {
  onSelect: (city: CitySuggestion) => void;
  autoSelectFirst?: boolean;
  placeholder?: string;
}

export default function CitySearch({
  onSelect,
  autoSelectFirst = false,
  placeholder = "Search a destination city…",
}: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSelected, setLastSelected] = useState<CitySuggestion | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounced = useDebouncedValue(query, 250);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  useEffect(() => {
    if (!debounced.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .autocompleteCities(debounced.trim())
      .then((res) => {
        if (!cancelled) {
          setSuggestions(res.suggestions);
          setOpen(true);
          if (autoSelectFirst && res.suggestions.length === 1) {
            handlePick(res.suggestions[0]);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Search failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, autoSelectFirst]);

  function handlePick(city: CitySuggestion) {
    setQuery(city.name);
    setSuggestions([]);
    setOpen(false);
    setLastSelected(city);
    onSelect(city);
  }

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setLastSelected(null);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-10 pl-10 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        {loading && (
          <Loader2 size={18} className="absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl">
          {suggestions.map((city, idx) => (
            <li key={`${city.name}-${city.latitude}-${city.longitude}-${idx}`}>
              <button
                type="button"
                onClick={() => handlePick(city)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-sky-50"
              >
                <MapPin size={16} className="shrink-0 text-sky-600" />
                <span className="flex-1 text-sm">
                  <span className="font-medium">{city.name}</span>
                  <span className="ml-2 flex items-center gap-1 text-slate-500">
                    <Globe2 size={13} />
                    {city.country}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {lastSelected && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-sky-700">
          <MapPin size={14} />
          {lastSelected.name}, {lastSelected.country}
        </p>
      )}
    </div>
  );
}
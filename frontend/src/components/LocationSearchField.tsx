import { MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface LocationSearchFieldProps {
  id: string;
  label: string;
  placeholder: string;
  accentClass: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  maxSuggestions?: number;
  labelAction?: React.ReactNode;
}

export default function LocationSearchField({
  id,
  label,
  placeholder,
  accentClass,
  value,
  onChange,
  suggestions,
  maxSuggestions = 7,
  labelAction,
}: LocationSearchFieldProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    const pool = q
      ? suggestions.filter((s) => s.toLowerCase().includes(q))
      : suggestions;
    return pool.slice(0, maxSuggestions);
  }, [value, suggestions, maxSuggestions]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function pick(s: string) {
    onChange(s);
    setOpen(false);
    setHighlight(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (matches.length > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (highlight >= 0 && matches[highlight]) {
        e.preventDefault();
        pick(matches[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  }

  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold tracking-wide text-cyan-100 uppercase">
        {label}
        {labelAction}
      </span>
      <div ref={rootRef} className="relative">
        <span className="flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-3 text-slate-900 ring-1 ring-transparent transition focus-within:ring-2 focus-within:ring-cyan-300">
          <MapPin size={17} className={`shrink-0 ${accentClass}`} />
          <input
            id={id}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
              setHighlight(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={open && matches.length > 0}
            aria-controls={`${id}-listbox`}
            aria-label={label}
            autoComplete="off"
            className="w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
          />
        </span>

        {open && matches.length > 0 && (
          <ul
            id={`${id}-listbox`}
            role="listbox"
            className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl bg-white py-1 text-slate-800 shadow-xl ring-1 ring-slate-200"
          >
            {matches.map((s, i) => (
              <li key={s} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(s);
                  }}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition ${
                    i === highlight ? "bg-sky-50 text-sky-900" : "hover:bg-slate-50"
                  }`}
                >
                  <MapPin
                    size={15}
                    className={i === highlight ? "text-sky-600" : "text-slate-400"}
                  />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </label>
  );
}
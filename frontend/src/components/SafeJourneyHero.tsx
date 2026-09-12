import { ArrowRight, LocateFixed, Loader2, MapPin, Sparkles } from "lucide-react";
import type { FormEvent } from "react";

import LocationSearchField from "./LocationSearchField";

interface SafeJourneyHeroProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onPlan: () => void;
  onTrySample: () => void;
  onUseMyLocation: () => void;
  locating: boolean;
  locationError: string | null;
  originSuggestions: string[];
  destinationSuggestions: string[];
}

export default function SafeJourneyHero({
  from,
  to,
  onFromChange,
  onToChange,
  onPlan,
  onTrySample,
  onUseMyLocation,
  locating,
  locationError,
  originSuggestions,
  destinationSuggestions,
}: SafeJourneyHeroProps) {
  const canPlan = from.trim().length > 0 && to.trim().length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (canPlan) onPlan();
  }

  return (
    <section className="relative rounded-3xl bg-gradient-to-br from-sky-700 via-indigo-700 to-fuchsia-800 px-6 py-10 text-white shadow-xl sm:px-10 lg:px-14 lg:py-14">
      {/* Decorative anchors stay clipped inside their own layer so dropdowns can overflow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <MapPin
          className="absolute top-8 right-8 hidden rotate-12 text-white/10 md:block"
          size={120}
          strokeWidth={1}
        />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-cyan-200 uppercase">
          <Sparkles size={14} />
          Trip Assistant · Tamil Nadu, India
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Tamil Nadu Trip Planner
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
          Use your current location or type any starting point, then pick a
          Tamil Nadu destination — temples, hill stations and coasts. Get route
          stats, safety alerts and top attractions before you leave home.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-3 rounded-2xl bg-white/10 p-3 shadow-lg ring-1 ring-white/20 backdrop-blur-sm sm:grid-cols-[1fr_1fr_auto] lg:p-4"
        >
          <LocationSearchField
            id="from"
            label="Starting Point"
            placeholder="e.g., Chennai"
            accentClass="text-emerald-600"
            value={from}
            onChange={onFromChange}
            suggestions={originSuggestions}
            labelAction={
              <button
                type="button"
                onClick={onUseMyLocation}
                disabled={locating}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-100 normal-case ring-1 ring-white/20 transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <LocateFixed size={11} className="text-cyan-300" />
                )}
                Use my location
              </button>
            }
          />

          <LocationSearchField
            id="to"
            label="Destination"
            placeholder="e.g., Ooty"
            accentClass="text-rose-500"
            value={to}
            onChange={onToChange}
            suggestions={destinationSuggestions}
          />

          <button
            type="submit"
            disabled={!canPlan}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-7 py-3 text-sm font-bold text-amber-950 shadow-md shadow-amber-500/30 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
          >
            Plan My Trip
            <ArrowRight size={17} />
          </button>
        </form>

        {locationError && (
          <p className="mt-3 text-xs text-amber-200">{locationError}</p>
        )}

        <p className="mt-3 text-xs text-indigo-200">
          Start typing for matching locations — or try{" "}
          <button
            type="button"
            onClick={onTrySample}
            className="font-semibold text-white underline decoration-cyan-300 underline-offset-2 transition hover:text-cyan-200"
          >
            Chennai → Kanyakumari
          </button>
          .
        </p>
      </div>
    </section>
  );
}
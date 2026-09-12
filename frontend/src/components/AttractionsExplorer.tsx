import { Check, Landmark, MapPin, Mountain, Plus, TreePine, Wallet } from "lucide-react";

import type {
  Attraction,
  AttractionCategory,
  AttractionTabKey,
  PlannedTrip,
} from "../types/safeJourney";
import Stars from "./Stars";

interface AttractionsExplorerProps {
  trip: PlannedTrip;
  activeTab: AttractionTabKey;
  onTabChange: (tab: AttractionTabKey) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  addedIds: string[];
  onToggleAdd: (id: string) => void;
}

const TABS: { key: AttractionTabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "nature", label: "Nature & Parks" },
  { key: "history", label: "Historical & Culture" },
  { key: "adventure", label: "Adventure & Fun" },
];

const CATEGORY_META: Record<
  AttractionCategory,
  { label: string; gradient: string; icon: typeof TreePine }
> = {
  nature: {
    label: "Nature & Parks",
    gradient: "from-emerald-400 to-green-700",
    icon: TreePine,
  },
  history: {
    label: "Historical & Culture",
    gradient: "from-amber-400 to-orange-700",
    icon: Landmark,
  },
  adventure: {
    label: "Adventure & Fun",
    gradient: "from-sky-400 to-indigo-700",
    icon: Mountain,
  },
};

function AttractionCard({
  attraction,
  currencySymbol,
  selected,
  added,
  onSelect,
  onToggleAdd,
}: {
  attraction: Attraction;
  currencySymbol: string;
  selected: boolean;
  added: boolean;
  onSelect: (id: string | null) => void;
  onToggleAdd: (id: string) => void;
}) {
  const meta = CATEGORY_META[attraction.category];
  const CategoryIcon = meta.icon;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? "border-sky-400 ring-2 ring-sky-400"
          : added
            ? "border-emerald-300 ring-1 ring-emerald-200"
            : "border-slate-200 hover:border-sky-300"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(selected ? null : attraction.id)}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
      >
        {/* Placeholder image */}
        <div
          className={`relative h-32 w-full overflow-hidden bg-gradient-to-br ${meta.gradient}`}
        >
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_45%),radial-gradient(circle_at_80%_70%,white_0,transparent_40%)]" />
          <CategoryIcon
            size={52}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md"
            strokeWidth={1.4}
          />
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            <CategoryIcon size={11} />
            {meta.label}
          </span>
          {added && (
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
              <Check size={11} />
              Added
            </span>
          )}
          <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-sm">
            <MapPin size={11} className="text-rose-500" />
            {attraction.distanceKm} km
          </span>
        </div>

        <div className="p-4 pb-2">
          <h3 className="font-bold text-slate-900 group-hover:text-sky-700">
            {attraction.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Stars rating={attraction.rating} />
            <span className="text-xs font-medium text-slate-500">
              {attraction.rating.toFixed(1)} · {attraction.reviews.toLocaleString("en-IN")}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">{attraction.highlight}</p>
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-4 pt-3 pb-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Wallet size={13} className="text-emerald-600" />
          {attraction.fee === 0
            ? "Free entry"
            : `${currencySymbol} ${attraction.fee}${attraction.fee > 0 ? "/person" : ""}`}
        </span>
        <button
          type="button"
          onClick={() => onToggleAdd(attraction.id)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            added
              ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              : "bg-sky-50 text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100"
          }`}
        >
          {added ? <Check size={13} /> : <Plus size={13} />}
          {added ? "Added to trip" : "Add to trip"}
        </button>
      </div>
    </div>
  );
}

export default function AttractionsExplorer({
  trip,
  activeTab,
  onTabChange,
  selectedId,
  onSelect,
  addedIds,
  onToggleAdd,
}: AttractionsExplorerProps) {
  const attractions = trip.profile.attractions;

  const counts = TABS.map((tab) => ({
    ...tab,
    count:
      tab.key === "all"
        ? attractions.length
        : attractions.filter((a) => a.category === tab.key).length,
  }));

  const visible =
    activeTab === "all"
      ? attractions
      : attractions.filter((a) => a.category === activeTab);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <MapPin size={18} className="text-rose-500" />
          Top Attractions in {trip.destination}
        </h2>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
          {visible.length} spot{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Filter attractions by category"
        className="mb-5 flex gap-2 overflow-x-auto pb-1"
      >
        {counts.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                active
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          No spots in this category yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((attraction) => (
            <AttractionCard
              key={attraction.id}
              attraction={attraction}
              currencySymbol={trip.profile.currencySymbol}
              selected={selectedId === attraction.id}
              added={addedIds.includes(attraction.id)}
              onSelect={onSelect}
              onToggleAdd={onToggleAdd}
            />
          ))}
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <Plus size={13} />
        Tap{" "}
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 font-bold text-sky-700 ring-1 ring-sky-200">
          <Plus size={11} /> Add to trip
        </span>
        on any spot to drop it into your Trip Schedule below.
      </p>
    </section>
  );
}
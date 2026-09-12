import { Check, Landmark, MapPin, Mountain, Plus, Route, TreePine } from "lucide-react";

import type { EnRouteStop, PlannedTrip } from "../types/safeJourney";
import Stars from "./Stars";

interface RoutePlacesProps {
  trip: PlannedTrip;
  addedIds: string[];
  onToggleAdd: (id: string) => void;
}

const CATEGORY_ICON = {
  nature: { icon: TreePine, cls: "bg-emerald-100 text-emerald-700" },
  history: { icon: Landmark, cls: "bg-amber-100 text-amber-700" },
  adventure: { icon: Mountain, cls: "bg-sky-100 text-sky-700" },
} as const;

function RouteStopRow({
  stop,
  destination,
  currencySymbol,
  added,
  onToggleAdd,
}: {
  stop: EnRouteStop;
  destination: string;
  currencySymbol: string;
  added: boolean;
  onToggleAdd: (id: string) => void;
}) {
  const meta = CATEGORY_ICON[stop.category];
  const Icon = meta.icon;

  return (
    <div
      className={`flex items-start gap-3.5 rounded-2xl border bg-white p-4 transition ${
        added ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200 hover:border-sky-300"
      }`}
    >
      <span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.cls}`}>
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="font-bold text-slate-900">{stop.name}</h3>
          {added && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
              <Check size={10} />
              Planned
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Stars rating={stop.rating} />
          <span className="text-xs font-medium text-slate-500">
            {stop.rating.toFixed(1)} · {stop.reviews.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {stop.fee === 0 ? "Free" : `${currencySymbol} ${stop.fee}${stop.fee > 0 ? "/person" : ""}`}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{stop.highlight}</p>
        <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-violet-700">
          <Route size={12} className="rotate-90" />
          {stop.distanceFromDestinationKm} km before {destination}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onToggleAdd(stop.id)}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
          added
            ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
            : "bg-sky-50 text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100"
        }`}
      >
        {added ? <Check size={13} /> : <Plus size={13} />}
        {added ? "Added" : "Add to trip"}
      </button>
    </div>
  );
}

export default function RoutePlaces({ trip, addedIds, onToggleAdd }: RoutePlacesProps) {
  const stops = [...trip.profile.enRoute].sort(
    (a, b) => a.distanceFromDestinationKm - b.distanceFromDestinationKm
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Route size={18} className="rotate-90 text-violet-600" />
            Places On Your Route
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Tourist spots you'll pass on the {trip.origin} → {trip.destination} drive —
            add them to your trip schedule.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
          {stops.length} stop{stops.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {stops.map((stop) => (
          <RouteStopRow
            key={stop.id}
            stop={stop}
            destination={trip.destination}
            currencySymbol={trip.profile.currencySymbol}
            added={addedIds.includes(stop.id)}
            onToggleAdd={onToggleAdd}
          />
        ))}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin size={13} />
        En-route stops appear as amber markers along the travel line in the Route Map.
      </p>
    </section>
  );
}
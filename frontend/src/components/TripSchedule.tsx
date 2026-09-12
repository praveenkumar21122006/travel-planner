import { useMemo } from "react";
import {
  CalendarDays,
  Car,
  Check,
  Clock3,
  ListChecks,
  MapPin,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import type {
  Attraction,
  AttractionCategory,
  PlannedTrip,
} from "../types/safeJourney";
import { primaryTravelTime } from "../data/safeJourney";

interface TripScheduleProps {
  trip: PlannedTrip;
  addedIds: string[];
  onRemovePick: (id: string) => void;
  tripSaved?: boolean;
  onSaveTrip?: () => void;
}

type StopKind = "departure" | "stop" | "meal" | "arrival" | "sight" | "free";

interface ScheduleStop {
  time: string;
  kind: StopKind;
  name: string;
  note?: string;
  id?: string;
  added?: boolean;
  category?: AttractionCategory | "route";
  fee?: number;
  rating?: number;
}

interface ScheduleDay {
  day: number;
  title: string;
  subtitle: string;
  stops: ScheduleStop[];
}

function parseDurationMinutes(s: string): number {
  const m = /(\d+)h(?:\s+(\d+)m)?/.exec(s);
  if (!m) return 300;
  return Number(m[1]) * 60 + (m[2] ? Number(m[2]) : 0);
}

function formatTime(totalMinutes: number): string {
  const h = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(h / 60)).padStart(2, "0");
  const mm = String(h % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function TripSchedule({
  trip,
  addedIds,
  onRemovePick,
  tripSaved = false,
  onSaveTrip,
}: TripScheduleProps) {
  const added = useMemo(() => new Set(addedIds), [addedIds]);

  const days = useMemo<ScheduleDay[]>(() => {
    const totalKm = trip.route.distanceKm || 400;
    const durationMin = parseDurationMinutes(primaryTravelTime(trip.route));
    const depart = 390; // 06:30

    const routeStops = [...trip.profile.enRoute].sort(
      (a, b) => b.distanceFromDestinationKm - a.distanceFromDestinationKm
    );

    const attractions = [...trip.profile.attractions].sort(
      (a, b) => b.rating - a.rating
    );

    // ── Day 1: the road between origin → destination ───────────
    const day1: ScheduleStop[] = [];
    day1.push({
      time: formatTime(depart),
      kind: "departure",
      name: `Depart ${trip.origin}`,
      note: `${totalKm} km · ${primaryTravelTime(trip.route)}`,
    });

    const driveWindow = Math.max(durationMin - 75, 120);
    const fractionAt = (km: number) =>
      Math.max(0.04, Math.min(0.9, 1 - km / totalKm));

    const orderedStops = routeStops
      .map((s) => ({ s, added: added.has(s.id) }))
      .sort(
        (a, b) =>
          Number(b.added) - Number(a.added) ||
          b.s.distanceFromDestinationKm - a.s.distanceFromDestinationKm
      );

    orderedStops.forEach(({ s }) => {
      const t = depart + Math.round(driveWindow * fractionAt(s.distanceFromDestinationKm));
      day1.push({
        time: formatTime(t),
        kind: "stop",
        name: s.name,
        id: s.id,
        added: added.has(s.id),
        category: s.category,
        fee: s.fee,
        rating: s.rating,
        note: `${s.distanceFromDestinationKm} km before ${trip.destination}`,
      });
    });

    if (day1.some((s) => s.kind === "stop")) {
      day1.push({
        time: formatTime(depart + Math.round(driveWindow * 0.72)),
        kind: "meal",
        name: "Lunch & rest stop",
        note: "Look for a local eatery near the route",
      });
    }

    day1.push({
      time: formatTime(depart + durationMin),
      kind: "arrival",
      name: `Arrive ${trip.destination}`,
      note: "Check in, freshen up, evening stroll",
    });

    // ── Day 2: exploring the destination ──────────────────────
    const picks: { time: number; cat: AttractionCategory; label: string }[] = [
      { time: 390, cat: "nature", label: "Sunrise & nature" },
      { time: 540, cat: "history", label: "Heritage & culture" },
      { time: 960, cat: "adventure", label: "Adventure & fun" },
    ];

    const pickFor = (cat: AttractionCategory): Attraction | undefined =>
      attractions
        .filter((a) => a.category === cat)
        .sort(
          (a, b) =>
            (added.has(b.id) ? 1 : 0) - (added.has(a.id) ? 1 : 0) ||
            b.rating - a.rating
        )[0];

    const day2: ScheduleStop[] = [];
    picks.forEach((slot) => {
      const attraction = pickFor(slot.cat);
      if (slot.cat === "adventure" && !attraction) return;
      if (!attraction) return;
      day2.push({
        time: formatTime(slot.time),
        kind: "sight",
        name: attraction.name,
        id: attraction.id,
        added: added.has(attraction.id),
        category: attraction.category,
        fee: attraction.fee,
        rating: attraction.rating,
        note: slot.label,
      });
    });
    day2.push({
      time: formatTime(780),
      kind: "meal",
      name: "Lunch & rest",
      note: `${trip.destination}'s local specialities`,
    });
    day2.push({
      time: formatTime(1080),
      kind: "free",
      name: "Sunset, market & free time",
      note: `Try a sunset walk near the ${trip.profile.bodyOfWater}`,
    });

    return [
      {
        day: 1,
        title: "On the road",
        subtitle: `${trip.origin} → ${trip.destination}`,
        stops: day1,
      },
      {
        day: 2,
        title: `In ${trip.destination}`,
        subtitle: "Top-rated highlights",
        stops: day2,
      },
    ];
  }, [trip, added]);

  const addedCount = addedIds.length;
  const routeStopCount = trip.profile.enRoute.length;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <CalendarDays size={18} className="text-violet-600" />
          Trip Schedule
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {onSaveTrip && (
            <button
              type="button"
              onClick={onSaveTrip}
              disabled={tripSaved}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                tripSaved
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-violet-600 text-white shadow-sm hover:bg-violet-700"
              }`}
            >
              {tripSaved ? <Check size={13} /> : <Save size={13} />}
              {tripSaved ? "Trip saved" : "Save trip"}
            </button>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
            <ListChecks size={13} />
            {addedCount} pick{addedCount === 1 ? "" : "s"} added
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            {routeStopCount} en-route spots
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {days.map((day) => (
          <div
            key={day.day}
            className="rounded-2xl border border-slate-200 bg-slate-50/60"
          >
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-slate-400">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-600 text-[11px] font-extrabold text-white">
                  {day.day}
                </span>
                {day.title}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                {day.subtitle}
              </p>
            </div>

            <ol className="relative px-4 py-3">
              {day.stops.map((stop, i) => {
                const isAdded = stop.added;
                return (
                  <li
                    key={`${day.day}-${stop.kind}-${stop.name}-${i}`}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    {i < day.stops.length - 1 && (
                      <span className="absolute top-7 left-[13px] h-[calc(100%-8px)] w-px border-l border-dashed border-slate-300" />
                    )}
                    <span className="absolute top-[4px] left-[13px] -translate-x-1/2">
                      {stop.kind === "meal" || stop.kind === "free" ? (
                        <span
                          className={`grid h-2.5 w-2.5 place-items-center rounded-full ${
                            stop.kind === "meal" ? "bg-amber-400" : "bg-slate-300"
                          }`}
                        />
                      ) : (
                        <span
                          className={`block h-2.5 w-2.5 rounded-full ring-4 ${
                            stop.kind === "departure"
                              ? "bg-emerald-500 ring-emerald-100"
                              : stop.kind === "arrival"
                                ? "bg-rose-500 ring-rose-100"
                                : isAdded
                                  ? "bg-violet-600 ring-violet-100"
                                  : "bg-sky-500 ring-sky-100"
                          }`}
                        />
                      )}
                    </span>

                    <div className="min-w-0 flex-1 pl-7">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                            stop.kind === "meal"
                              ? "bg-amber-100 text-amber-800"
                              : stop.kind === "free"
                                ? "bg-slate-200 text-slate-600"
                                : stop.kind === "departure"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : stop.kind === "arrival"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          <Clock3 size={10} />
                          {stop.time}
                        </span>
                        {isAdded && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            <Check size={10} />
                            Your pick
                          </span>
                        )}
                        {!isAdded &&
                          stop.kind === "stop" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              <Sparkles size={10} />
                              Suggested
                            </span>
                          )}
                      </div>

                      <p className="mt-1 leading-snug font-semibold text-slate-800">
                        {stop.name}
                      </p>
                      {stop.note && (
                        <p className="mt-0.5 text-xs text-slate-500">{stop.note}</p>
                      )}
                      {typeof stop.fee === "number" && (
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {stop.fee === 0
                            ? "Free"
                            : `${trip.profile.currencySymbol} ${stop.fee}/person`}
                        </p>
                      )}
                    </div>

                    {isAdded && stop.id && (
                      <button
                        type="button"
                        onClick={() => onRemovePick(stop.id!)}
                        aria-label={`Remove ${stop.name} from schedule`}
                        className="self-start rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-sky-50 px-4 py-3 text-xs text-slate-600 ring-1 ring-sky-100">
        <span className="flex items-center gap-1.5 font-semibold text-sky-800">
          <Car size={14} />
          Travel estimate
        </span>
        <span>{trip.route.distanceKm} km</span>
        <span className="text-slate-400">·</span>
        <span>{primaryTravelTime(trip.route)}</span>
        <span className="text-slate-400">·</span>
        <span className="inline-flex items-center gap-1">
          <MapPin size={13} className="text-rose-500" />
          Times are flexible suggestions — reorder to suit your pace.
        </span>
      </div>
    </section>
  );
}
import { useMemo } from "react";
import { MapPin, Navigation, Route as RouteIcon, Waves } from "lucide-react";

import type { Activity, Trip } from "../types";
import { formatDateRange } from "./Sidebar";

interface MapPanelProps {
  trip: Trip;
  activities: Activity[];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface PlacedPin {
  activity: Activity;
  x: number;
  y: number;
}

function placePins(activities: Activity[], trip: Trip): PlacedPin[] {
  const seed = hashString(trip.destinationCity + trip.id);
  const sorted = [...activities].sort(
    (a, b) => a.dayNumber - b.dayNumber || a.timeSlot.localeCompare(b.timeSlot)
  );

  return sorted.map((activity, idx) => {
    const h = hashString(activity.id);
    const jitter = (h % 100) / 100;
    const ring = 0.16 + (idx % 3) * 0.12;
    const angle = (idx * 1.7 + jitter * 1.2) * Math.PI;
    const x = 0.5 + Math.cos(angle) * ring + (seed % 40) / 1000;
    const y = 0.5 + Math.sin(angle) * ring * 0.8 + ((seed >> 4) % 40) / 1000;
    return { activity, x: clamp(x), y: clamp(y) };
  });

  function clamp(v: number) {
    return Math.min(0.88, Math.max(0.12, v));
  }
}

export default function MapPanel({ trip, activities }: MapPanelProps) {
  const pins = useMemo(() => placePins(activities, trip), [activities, trip]);
  const totalDays = useMemo(() => {
    const ms = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
    return Math.max(1, Math.round(ms / 86_400_000) + 1);
  }, [trip]);

  return (
    <div className="flex h-full flex-col">
      {/* Destination summary */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <MapPin size={18} className="text-rose-500" />
              {trip.destinationCity}
            </h2>
            <p className="text-sm text-slate-500">{trip.country}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        {/* Simulated basemap */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 400" preserveAspectRatio="none">
          {/* "Roads" */}
          <path d="M0 130 C 90 110, 150 200, 260 170 S 400 200 400 190" fill="none" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
          <path d="M60 0 C 80 120, 40 250, 120 400" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
          <path d="M0 320 C 120 300, 220 340, 400 290" fill="none" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
          {/* Water */}
          <path d="M300 0 C 260 80, 360 120, 330 200 S 400 300, 370 400 L400 400 L400 0 Z" fill="#bfdbfe" opacity="0.6" />
          {/* Route polyline */}
          {pins.length > 1 && (
            <polyline
              points={pins.map((p) => `${p.x * 400},${p.y * 400}`).join(" ")}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          )}
        </svg>

        {/* Pins */}
        {pins.map(({ activity, x, y }, idx) => (
          <div
            key={activity.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
          >
            <div className="flex flex-col items-center">
              <span className="rounded-full bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                {idx + 1}
              </span>
              <MapPinPin
                className={`-mt-0.5 ${idx === 0 ? "text-emerald-500" : "text-rose-500"}`}
              />
              <span className="max-w-[110px] truncate rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 shadow">
                {activity.title}
              </span>
            </div>
          </div>
        ))}

        {/* Routing module overlay */}
        <div className="absolute right-3 bottom-3 z-20 w-52 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Navigation size={13} className="text-sky-600" />
            Routing module
          </p>
          <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
            {pins.length > 0 ? (
              pins.map(({ activity }, idx) => (
                <li key={activity.id} className="flex items-center gap-1.5">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sky-100 text-[9px] font-bold text-sky-700">
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{activity.title}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400">No stops yet — add activities to plan a route.</li>
            )}
          </ul>
          {pins.length > 0 && (
            <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
              {pins.length} stop{pins.length === 1 ? "" : "s"} · {Math.max(0, pins.length - 1) * 12}
              min estimated drive between stops
            </p>
          )}
        </div>

        {/* Grid / route legend */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow backdrop-blur">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Start
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Stops
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            <RouteIcon size={12} className="text-sky-600" /> Route
          </span>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <Waves size={13} />
        Interactive map preview ({tripsScope(trip, totalDays)}). Connect a mapping provider to
        geocode activity titles into live pins and routes.
      </p>
    </div>
  );
}

function MapPinPin({ className = "" }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" fill="white" />
    </svg>
  );
}

function tripsScope(trip: Trip, totalDays: number) {
  return `${trip.destinationCity} · ${totalDays} day${totalDays === 1 ? "" : "s"}`;
}
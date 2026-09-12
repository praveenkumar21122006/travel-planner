import { useState } from "react";
import {
  Bookmark,
  CalendarClock,
  Clock3,
  FolderOpen,
  MapPin,
  Plus,
  Route,
} from "lucide-react";

import type { SavedTripRecord } from "../types/safeJourney";
import { primaryTravelTime } from "../data/safeJourney";

interface SavedTripsPanelProps {
  saved: SavedTripRecord[];
  activeKey: string | null;
  onOpen: (record: SavedTripRecord) => void;
  onDelete: (id: string) => void;
}

export default function SavedTripsPanel({
  saved,
  activeKey,
  onOpen,
  onDelete,
}: SavedTripsPanelProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  }

  const sorted = [...saved].sort((a, b) => b.savedAt - a.savedAt);

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Bookmark size={18} className="text-amber-600" />
          Saved Trips & Places
        </h2>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          {saved.length} saved {saved.length === 1 ? "trip" : "trips"}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <Bookmark size={22} />
          </div>
          <p className="font-bold text-slate-700">No saved trips yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
            Plan a route, add your places, then hit{" "}
            <span className="font-semibold text-slate-700">Save trip</span> on
            the schedule to keep it here — routes and places together.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {sorted.map((record) => {
            const isActive = activeKey === record.trip.destination.toLowerCase();
            const stopNames = record.trip.profile.attractions
              .filter((a) => record.addedIds.includes(a.id))
              .map((a) => a.name)
              .concat(
                record.trip.profile.enRoute
                  .filter((s) => record.addedIds.includes(s.id))
                  .map((s) => s.name)
              );
            const travel = primaryTravelTime(record.trip.route);

            return (
              <div
                key={record.id}
                className={`flex flex-col rounded-2xl border bg-white p-4 transition ${
                  isActive
                    ? "border-amber-300 ring-1 ring-amber-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {record.from} <span className="text-slate-400">→</span>{" "}
                      {record.to}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Route size={11} className="text-violet-600" />
                        {record.trip.route.distanceKm} km
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={11} className="text-sky-600" />
                        {travel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} className="text-rose-500" />
                        {stopNames.length} place{stopNames.length === 1 ? "" : "s"}
                      </span>
                    </p>
                  </div>
                  {isActive && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      <CalendarClock size={11} />
                      Open now
                    </span>
                  )}
                </div>

                {stopNames.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {stopNames.slice(0, 5).map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        {name}
                      </span>
                    ))}
                    {stopNames.length > 5 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                        +{stopNames.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <p className="text-[11px] text-slate-400">
                    Saved {new Date(record.savedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                        confirmId === record.id
                          ? "bg-rose-600 text-white hover:bg-rose-700"
                          : "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      }`}
                    >
                      {confirmId === record.id ? "Sure?" : "Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpen(record)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <FolderOpen size={13} />
                      Open
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <Plus size={13} />
        Saved on this device (localStorage). Open a trip to restore its route,
        schedule and places — then add more below.
      </p>
    </section>
  );
}
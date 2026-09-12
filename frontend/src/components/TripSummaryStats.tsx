import { Clock, MapPin, Route } from "lucide-react";

import type { PlannedTrip } from "../types/safeJourney";
import { primaryTravelTime, secondaryTravelTime } from "../data/safeJourney";
import { STATUS_META } from "./statusStyles";

interface TripSummaryStatsProps {
  trip: PlannedTrip;
}

export default function TripSummaryStats({ trip }: TripSummaryStatsProps) {
  const status = STATUS_META[trip.safetyStatus];
  const timeLabel = primaryTravelTime(trip.route);
  const altLabel = secondaryTravelTime(trip.route);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Route size={18} className="text-sky-600" />
          Trip Summary
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
          <MapPin size={14} className="text-emerald-600" />
          {trip.origin}
          <span className="text-slate-300">→</span>
          <MapPin size={14} className="text-rose-500" />
          {trip.destination}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MapStatCard
          icon={Route}
          iconClass="text-sky-600 bg-sky-50"
          label="Total Distance"
          value={`${trip.route.distanceKm.toLocaleString("en-IN")} km`}
          subLabel={`direct distance, ${trip.origin} → ${trip.destination}`}
        />
        <MapStatCard
          icon={Clock}
          iconClass="text-indigo-600 bg-indigo-50"
          label="Estimated Travel Time"
          value={timeLabel}
          subLabel={altLabel}
        />
        <div
          className={`flex flex-col justify-between rounded-2xl p-5 ring-1 ${status.card} transition`}
        >
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${status.chip}`}>
                <status.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-600">Safe-to-Visit Status</p>
                <span
                  className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${status.chip}`}
                >
                  <status.icon size={12} />
                  {status.label}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{trip.profile.safetyNote}</p>
        </div>
      </div>
    </section>
  );
}

function MapStatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  subLabel,
}: {
  icon: typeof Route;
  iconClass: string;
  label: string;
  value: string;
  subLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${iconClass}`}>
          <Icon size={20} />
        </span>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      <p className="text-xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {subLabel && <p className="mt-1 text-xs text-slate-500">{subLabel}</p>}
    </div>
  );
}
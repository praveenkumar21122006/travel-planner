import { CalendarDays, ChevronRight, MapPin, Route } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Trip } from "../types";
import { formatDateRange } from "./Sidebar";
import WeatherBadge from "./WeatherBadge";

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const navigate = useNavigate();
  const activityCount = trip.activities?.length ?? 0;

  return (
    <button
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
          <MapPin size={20} />
        </div>
        <WeatherBadge city={trip.destinationCity} country={trip.country} compact />
      </div>

      <h3 className="text-lg font-bold text-slate-900">
        {trip.destinationCity}
        <span className="block text-sm font-medium text-slate-500">{trip.country}</span>
      </h3>

      <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
        <CalendarDays size={15} className="text-slate-400" />
        {formatDateRange(trip.startDate, trip.endDate)}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          <Route size={12} />
          {activityCount} {activityCount === 1 ? "activity" : "activities"}
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold text-sky-600 transition group-hover:gap-2">
          Open itinerary
          <ChevronRight size={16} />
        </span>
      </div>
    </button>
  );
}
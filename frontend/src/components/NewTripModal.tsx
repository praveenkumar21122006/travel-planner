import { useState, type FormEvent } from "react";
import { CalendarRange, Loader2, MapPin, X } from "lucide-react";

import type { CitySuggestion } from "../types";
import CitySearch from "./CitySearch";

interface NewTripModalProps {
  open: boolean;
  onClose: () => void;
  initialCity?: CitySuggestion | null;
  onCreate: (draft: {
    destinationCity: string;
    country: string;
    startDate: string;
    endDate: string;
  }) => Promise<void>;
}

const toLocalISODate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function NewTripModal({
  open,
  onClose,
  initialCity = null,
  onCreate,
}: NewTripModalProps) {
  const today = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const [city, setCity] = useState<CitySuggestion | null>(initialCity);
  const [startDate, setStartDate] = useState(toLocalISODate(today));
  const [endDate, setEndDate] = useState(toLocalISODate(weekFromNow));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!city) {
      setError("Select a destination city from the suggestions");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be on or after the start date");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        destinationCity: city.name,
        country: city.country,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      onClose();
      setCity(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create trip");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CalendarRange size={18} className="text-sky-600" />
              New Trip
            </h2>
            <p className="text-sm text-slate-500">Where are you heading next?</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Destination</span>
            <CitySearch onSelect={setCity} placeholder="e.g. Paris, France" />
            {city && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
<MapPin size={12} />
              {city.name}, {city.country}
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Start date</span>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">End date</span>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Create trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
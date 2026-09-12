import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Compass,
  LogOut,
  MapPin,
  Plane,
  Plus,
  Route,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { CitySuggestion, Trip } from "../types";
import { api, ApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import CitySearch from "../components/CitySearch";
import TripCard from "../components/TripCard";
import NewTripModal from "../components/NewTripModal";
import WeatherBadge from "../components/WeatherBadge";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CitySuggestion | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoadingTrips(true);
    setTripsError(null);
    try {
      setTrips(await api.getTrips());
    } catch (err) {
      setTripsError(err instanceof ApiError ? err.message : "Failed to load trips");
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  useEffect(() => {
    void loadTrips();
  }, [loadTrips]);

  const upcoming = trips.filter((t) => new Date(t.endDate) >= new Date());
  const past = trips.filter((t) => new Date(t.endDate) < new Date());

  async function handleCreate(draft: {
    destinationCity: string;
    country: string;
    startDate: string;
    endDate: string;
  }) {
    await api.createTrip(draft);
    setSelected(null);
    await loadTrips();
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 lg:hidden">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Plane size={18} className="text-sky-600" />
            Travel Planner
          </Link>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-5 py-8">
          {/* Hero search */}
          <section className="rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 p-6 text-white shadow-lg lg:p-8">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-sky-100">
              <Sparkles size={15} />
              Welcome back, {user?.email?.split("@")[0] ?? "traveler"}
            </div>
            <h1 className="mb-1 text-2xl font-bold lg:text-3xl">Where to next?</h1>
            <p className="mb-5 text-sm text-sky-100">
              Search any destination to preview its 5-day forecast, then plan your trip.
            </p>
            <CitySearch onSelect={setSelected} placeholder="Search a destination city…" />
          </section>

          {/* Search result preview */}
          {selected && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <MapPin size={18} className="text-sky-600" />
                  {selected.name}, {selected.country}
                </h2>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  <Plus size={15} />
                  Plan a trip here
                </button>
              </div>
              <WeatherBadge city={selected.name} country={selected.country} />
            </section>
          )}

          {/* Upcoming trips */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <CalendarDays size={18} className="text-sky-600" />
                Upcoming Trips
              </h2>
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <Plus size={15} />
                New trip
              </button>
            </div>

            {loadingTrips ? (
              <p className="py-8 text-center text-slate-400">Loading your trips…</p>
            ) : tripsError ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{tripsError}</p>
            ) : upcoming.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                <Compass size={36} className="mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-slate-700">No upcoming trips yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Search a city above and hit "Plan a trip here" to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </section>

          {/* Past trips */}
          {past.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-600">
                <Route size={18} className="text-slate-400" />
                Past Trips
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {past.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <NewTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialCity={selected}
        onCreate={handleCreate}
      />
    </div>
  );
}
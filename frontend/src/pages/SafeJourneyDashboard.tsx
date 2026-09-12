import { useEffect, useState } from "react";
import {
  Compass,
  Globe2,
  Search,
  ShieldCheck,
  Bookmark,
  X,
} from "lucide-react";

import AttractionsExplorer from "../components/AttractionsExplorer";
import AdvisoryPanel from "../components/AdvisoryPanel";
import MapWidget from "../components/MapWidget";
import RoutePlaces from "../components/RoutePlaces";
import SafeJourneyHero from "../components/SafeJourneyHero";
import SavedTripsPanel from "../components/SavedTripsPanel";
import TripSchedule from "../components/TripSchedule";
import TripSummaryStats from "../components/TripSummaryStats";
import {
  ALL_DESTINATIONS,
  ALL_ORIGINS,
  nearestOrigin,
  POPULAR_TAMIL_NADU,
  resolveTrip,
} from "../data/safeJourney";
import {
  loadSavedTrips,
  persistSavedTrips,
  upsertSavedTrip,
} from "../lib/savedTrips";
import type {
  AttractionTabKey,
  PlannedTrip,
  SavedTripRecord,
} from "../types/safeJourney";

export default function SafeJourneyDashboard() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trip, setTrip] = useState<PlannedTrip | null>(null);
  const [activeTab, setActiveTab] = useState<AttractionTabKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedTripRecord[]>(() => loadSavedTrips());
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    persistSavedTrips(saved);
  }, [saved]);

  const hasSearched = from.trim().length > 0 || to.trim().length > 0;
  const activeTripKey = trip ? trip.destination.toLowerCase() : null;
  const currentTripSaved = trip
    ? saved.some(
        (s) =>
          s.to.toLowerCase() === trip.destination.toLowerCase() &&
          s.from.toLowerCase() === trip.origin.toLowerCase()
      )
    : false;

  function resetPicks() {
    setAddedIds([]);
  }

  function toggleAdd(id: string) {
    setAddedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSaveTrip() {
    if (!trip) return;
    setSaved((prev) => upsertSavedTrip(prev, trip, addedIds));
  }

  function handleOpenSaved(record: SavedTripRecord) {
    setFrom(record.from);
    setTo(record.to);
    setTrip(record.trip);
    setAddedIds(record.addedIds);
    setActiveTab("all");
    setSelectedId(null);
    setShowSaved(false);
  }

  function handleDeleteSaved(id: string) {
    setSaved((prev) => prev.filter((s) => s.id !== id));
  }

  function handlePlan() {
    const next = resolveTrip(from, to);
    setTrip(next);
    setActiveTab("all");
    setSelectedId(null);
    resetPicks();
  }

  function planTo(destination: string, origin?: string) {
    if (origin !== undefined) setFrom(origin);
    setTo(destination);
    const next = resolveTrip(origin ?? from, destination);
    setTrip(next);
    setActiveTab("all");
    setSelectedId(null);
    resetPicks();
  }

  function planSample() {
    planTo("Kanyakumari", "Chennai");
  }

  async function handleUseMyLocation() {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation isn't available in this browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      );
      const origin = nearestOrigin(pos.coords.latitude, pos.coords.longitude);
      setFrom(origin.name);
    } catch {
      setLocationError(
        "Couldn't get your location — check permission and try again, or type your starting point."
      );
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top app bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
              <Compass size={20} />
            </div>
            <div>
              <h1 className="font-bold leading-tight tracking-tight">
                Tamil Nadu Trip Planner
              </h1>
              <p className="text-xs text-slate-500">
                Trip Assistant ·{" "}
                {trip ? `${trip.origin} → ${trip.destination}` : "Tamil Nadu, India"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSaved((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                showSaved
                  ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                  : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200"
              }`}
            >
              {showSaved ? <X size={13} /> : <Bookmark size={13} />}
              Saved
              {saved.length > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                  {saved.length}
                </span>
              )}
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck size={13} />
              Tamil Nadu mock data
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="space-y-8 py-6 lg:py-8">
          <SafeJourneyHero
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
            onPlan={handlePlan}
            onTrySample={planSample}
            onUseMyLocation={handleUseMyLocation}
            locating={locating}
            locationError={locationError}
            originSuggestions={ALL_ORIGINS}
            destinationSuggestions={ALL_DESTINATIONS}
          />

          {showSaved && (
            <SavedTripsPanel
              saved={saved}
              activeKey={activeTripKey}
              onOpen={handleOpenSaved}
              onDelete={handleDeleteSaved}
            />
          )}

          {trip ? (
            <div className="grid items-start gap-8 lg:grid-cols-3">
              <div className="min-w-0 space-y-8 lg:col-span-2">
                <TripSummaryStats trip={trip} />
                <RoutePlaces
                  trip={trip}
                  addedIds={addedIds}
                  onToggleAdd={toggleAdd}
                />
                <TripSchedule
                  trip={trip}
                  addedIds={addedIds}
                  onRemovePick={toggleAdd}
                  tripSaved={currentTripSaved}
                  onSaveTrip={handleSaveTrip}
                />
                <AdvisoryPanel trip={trip} />
                <AttractionsExplorer
                  key={trip.profile.id}
                  trip={trip}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  addedIds={addedIds}
                  onToggleAdd={toggleAdd}
                />
              </div>

              <aside className="min-w-0 lg:sticky lg:top-6">
                <MapWidget trip={trip} selectedId={selectedId} />
              </aside>
            </div>
          ) : hasSearched ? (
            <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <p className="text-lg font-bold text-slate-700">
                No preview for {to.trim() || "that destination"} yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                We don't have details for that search yet. Pick a match from the
                autocomplete list — or jump straight to one of these:
              </p>
              <div className="mx-auto mt-5 flex max-w-lg flex-wrap justify-center gap-2">
                {POPULAR_TAMIL_NADU.map((name) => (
                  <button
                    key={name}
                    onClick={() => planTo(name)}
                    className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-100"
                  >
                    {name}
                  </button>
                ))}
              </div>
              <button
                onClick={handlePlan}
                className="mt-6 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Plan again
              </button>
            </section>
          ) : (
            <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                <Globe2 size={26} />
              </div>
              <p className="text-lg font-bold text-slate-700">
                Where are you headed?
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Type a starting point and destination above, then hit{" "}
                <span className="font-semibold text-slate-700">Plan My Trip</span>{" "}
                to see route stats, safety alerts and top attractions.
              </p>
              <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 pr-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  <Search size={13} />
                  Popular in Tamil Nadu
                </span>
                {POPULAR_TAMIL_NADU.slice(0, 6).map((name) => (
                  <button
                    key={name}
                    onClick={() => planTo(name)}
                    className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 transition hover:bg-sky-100"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
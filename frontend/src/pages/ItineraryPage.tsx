import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import type { Activity, TimeSlot, Trip } from "../types";
import { api, ApiError } from "../services/api";
import Sidebar, { daysBetween, formatDateRange } from "../components/Sidebar";
import DaySection from "../components/DaySection";
import ActivityFormModal, {
  type ActivityFormValue,
} from "../components/ActivityFormModal";
import MapPanel from "../components/MapPanel";

export default function ItineraryPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [defaultDay, setDefaultDay] = useState(1);
  const [defaultSlot, setDefaultSlot] = useState<TimeSlot>("morning");

  const totalDays = useMemo(
    () => (trip ? daysBetween(trip.startDate, trip.endDate) : 1),
    [trip]
  );

  const load = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const [tripRes, activitiesRes] = await Promise.all([
        api.getTrip(tripId),
        api.getActivities(tripId),
      ]);
      setTrip(tripRes);
      setActivities(activitiesRes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load itinerary");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreateActivity(value: ActivityFormValue) {
    if (!tripId) return;
    const created = await api.createActivity(tripId, value);
    setActivities((prev) => [...prev, created]);
  }

  async function handleUpdateActivity(value: ActivityFormValue) {
    if (!tripId || !editing) return;
    const updated = await api.updateActivity(tripId, editing.id, value);
    setActivities((prev) => prev.map((a) => (a.id === editing.id ? updated : a)));
  }

  async function handleDeleteActivity(activityId: string) {
    if (!tripId) return;
    await api.deleteActivity(tripId, activityId);
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
  }

  async function handleDeleteTrip() {
    if (!tripId) return;
    if (!window.confirm(`Delete this ${trip?.destinationCity} trip and all its activities?`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteTrip(tripId);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete trip");
      setDeleting(false);
    }
  }

  function openAdd(day: number, slot: TimeSlot) {
    setEditing(null);
    setDefaultDay(day);
    setDefaultSlot(slot);
    setModalOpen(true);
  }

  function openEdit(activity: Activity) {
    setEditing(activity);
    setDefaultDay(activity.dayNumber);
    setDefaultSlot(activity.timeSlot);
    setModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="grid flex-1 place-items-center text-slate-400">
          <Loader2 className="animate-spin" size={28} />
        </main>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-semibold text-red-700">{error ?? "Trip not found"}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            <ArrowLeft size={15} />
            Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                to="/"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold sm:text-xl">
                  {trip.destinationCity}
                  <span className="ml-2 font-medium text-slate-500">{trip.country}</span>
                </h1>
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={13} />
                  {formatDateRange(trip.startDate, trip.endDate)} · {totalDays} day
                  {totalDays === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAdd(1, "morning")}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <Plus size={15} />
                Add activity
              </button>
              <button
                onClick={handleDeleteTrip}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 size={15} />
                {deleting ? "Deleting…" : "Delete trip"}
              </button>
            </div>
          </div>
        </header>

        {/* Split-pane itinerary builder */}
        <main className="flex flex-1 flex-col gap-6 p-6 lg:flex-row lg:overflow-hidden">
          {/* Left: timeline */}
          <section className="flex min-w-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:max-h-[calc(100vh-200px)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wide text-slate-500 uppercase">
                Day-by-day plan
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {activities.length} activities
              </span>
            </div>

            {activities.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 px-6 py-10 text-center">
                <p className="font-semibold text-slate-600">Start building your itinerary</p>
                <p className="mt-1 text-sm text-slate-500">
                  Add activities to each day and time slot below.
                </p>
                <button
                  onClick={() => openAdd(1, "morning")}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  <Plus size={15} />
                  Add first activity
                </button>
              </div>
            ) : (
              <div className="space-y-8 py-1">
                {days.map((day) => (
                  <DaySection
                    key={day}
                    day={day}
                    activities={activities.filter((a) => a.dayNumber === day)}
                    onEdit={openEdit}
                    onDelete={handleDeleteActivity}
                    onAdd={(slot) => openAdd(day, slot)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Right: map routing placeholder */}
          <section className="min-w-0 shrink-0 rounded-2xl bg-slate-900 p-5 lg:w-[46%] lg:max-h-[calc(100vh-200px)]">
            <div className="mb-3 flex items-center justify-between text-slate-300">
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
                <ArrowUpRight size={15} />
                Live route preview
              </h2>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-400">
                Simulation
              </span>
            </div>
            <MapPanel trip={trip} activities={activities} />
          </section>
        </main>
      </div>

      <ActivityFormModal
        open={modalOpen}
        totalDays={totalDays}
        initial={editing}
        defaultDay={defaultDay}
        defaultSlot={defaultSlot}
        onClose={() => setModalOpen(false)}
        onSubmit={editing ? handleUpdateActivity : handleCreateActivity}
      />
    </div>
  );
}
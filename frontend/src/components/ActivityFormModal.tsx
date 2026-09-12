import { useEffect, useState, type FormEvent } from "react";
import { Coffee, Loader2, Moon, Sun, X } from "lucide-react";

import type { Activity, TimeSlot } from "../types";

export interface ActivityFormValue {
  dayNumber: number;
  timeSlot: TimeSlot;
  title: string;
  description: string;
}

interface ActivityFormModalProps {
  open: boolean;
  totalDays: number;
  initial?: Activity | null;
  defaultDay?: number;
  defaultSlot?: TimeSlot;
  onClose: () => void;
  onSubmit: (value: ActivityFormValue) => Promise<void>;
}

const SLOTS: { value: TimeSlot; label: string; icon: typeof Sun }[] = [
  { value: "morning", label: "Morning", icon: Sun },
  { value: "afternoon", label: "Afternoon", icon: Coffee },
  { value: "evening", label: "Evening", icon: Moon },
];

export default function ActivityFormModal({
  open,
  totalDays,
  initial,
  defaultDay = 1,
  defaultSlot = "morning",
  onClose,
  onSubmit,
}: ActivityFormModalProps) {
  const [dayNumber, setDayNumber] = useState(defaultDay);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>(defaultSlot);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDayNumber(initial?.dayNumber ?? defaultDay);
      setTimeSlot(initial?.timeSlot ?? defaultSlot);
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setError(null);
    }
  }, [open, initial, defaultDay, defaultSlot]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ dayNumber, timeSlot, title, description });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save activity");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {initial ? "Edit activity" : "Add activity"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="e.g. Visit the Eiffel Tower"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Notes</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Optional details…"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Day</span>
              <select
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">Time slot</span>
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-300 p-1">
                {SLOTS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTimeSlot(value)}
                    className={`flex items-center justify-center gap-1 rounded-md px-1 py-1.5 text-xs font-medium transition ${
                      timeSlot === value
                        ? "bg-sky-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
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
              {initial ? "Save changes" : "Add activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
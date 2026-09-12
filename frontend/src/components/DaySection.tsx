import { Coffee, Moon, Sun } from "lucide-react";

import type { Activity, TimeSlot } from "../types";
import ActivityCard from "./ActivityCard";

interface DaySectionProps {
  day: number;
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  onAdd: (slot: TimeSlot) => void;
}

const SLOT_CONFIG: Record<
  TimeSlot,
  { label: string; icon: typeof Sun; badge: string }
> = {
  morning: { label: "Morning", icon: Sun, badge: "bg-amber-100 text-amber-700" },
  afternoon: { label: "Afternoon", icon: Coffee, badge: "bg-sky-100 text-sky-700" },
  evening: { label: "Evening", icon: Moon, badge: "bg-indigo-100 text-indigo-700" },
};

export default function DaySection({
  day,
  activities,
  onEdit,
  onDelete,
  onAdd,
}: DaySectionProps) {
  const slots: TimeSlot[] = ["morning", "afternoon", "evening"];

  return (
    <div className="relative pl-10">
      {/* Timeline spine */}
      <span className="absolute top-2 bottom-2 left-[15px] w-px bg-slate-200" />

      {/* Day node */}
      <span className="absolute top-1 left-0 z-10 grid h-8 w-8 place-items-center rounded-full border-2 border-sky-600 bg-white text-xs font-bold text-sky-700">
        {day}
      </span>

      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-wide text-slate-700 uppercase">
          Day {day}
        </h3>

        {slots.map((slot) => {
          const slotActivities = activities.filter((a) => a.timeSlot === slot);
          const config = SLOT_CONFIG[slot];
          const Icon = config.icon;

          return (
            <div key={slot} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}>
                  <Icon size={12} />
                  {config.label}
                </span>
                <AddSlotButton onClick={() => onAdd(slot)} />
              </div>

              {slotActivities.length === 0 ? (
                <p className="px-1 text-xs text-slate-400">No activities planned</p>
              ) : (
                <ul className="space-y-2">
                  {slotActivities.map((activity) => (
                    <li key={activity.id}>
                      <ActivityCard
                        activity={activity}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddSlotButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-2 py-1 text-xs font-semibold text-sky-600 transition hover:bg-sky-50"
    >
      + Add
    </button>
  );
}
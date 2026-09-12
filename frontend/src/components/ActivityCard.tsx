import { useState } from "react";
import { Clock, Pencil, Trash2 } from "lucide-react";

import type { Activity } from "../types";

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
}

export default function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{activity.title}</p>
          {activity.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{activity.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onEdit(activity)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"
            aria-label="Edit activity"
          >
            <Pencil size={14} />
          </button>
          {confirming ? (
            <button
              onClick={() => onDelete(activity.id)}
              onMouseLeave={() => setConfirming(false)}
              className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label="Delete activity"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
        <Clock size={11} />
        {activity.timeSlot[0].toUpperCase() + activity.timeSlot.slice(1)} · Day{" "}
        {activity.dayNumber}
      </div>
    </div>
  );
}
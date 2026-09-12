import { AlertTriangle, CloudRain, Info, Lightbulb, Newspaper } from "lucide-react";

import type { DestinationAlert, PlannedTrip } from "../types/safeJourney";
import { STATUS_META } from "./statusStyles";

interface AdvisoryPanelProps {
  trip: PlannedTrip;
}

const SEVERITY_META = {
  warning: {
    bar: "bg-amber-500",
    chip: "bg-amber-100 text-amber-800",
    icon: AlertTriangle,
  },
  info: {
    bar: "bg-sky-500",
    chip: "bg-sky-100 text-sky-800",
    icon: Info,
  },
  advisory: {
    bar: "bg-red-500",
    chip: "bg-red-100 text-red-800",
    icon: AlertTriangle,
  },
} as const;

function AlertCard({ alert }: { alert: DestinationAlert }) {
  const meta = SEVERITY_META[alert.severity];
  const isWeather = alert.kind === "weather";
  const Icon = isWeather ? CloudRain : Newspaper;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <span className={`absolute inset-y-0 left-0 w-1 ${meta.bar}`} />
      <div className="flex items-start gap-3.5">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.chip}`}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              {isWeather ? "Weather Alert" : "Local News & Safety"}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}
            >
              {alert.severity}
            </span>
          </div>
          <h3 className="mt-0.5 font-bold text-slate-900">{alert.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{alert.detail}</p>
        </div>
      </div>
    </article>
  );
}

export default function AdvisoryPanel({ trip }: AdvisoryPanelProps) {
  const status = STATUS_META[trip.safetyStatus];

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <AlertTriangle size={18} className="text-amber-500" />
        Safety & Advisory Alerts
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {trip.profile.alerts.map((alert) => (
          <AlertCard key={`${alert.kind}-${alert.title}`} alert={alert} />
        ))}
      </div>

      <div className={`mt-4 flex flex-wrap items-center gap-3 rounded-2xl px-5 py-4 ring-1 ${status.card}`}>
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${status.chip}`}
        >
          <status.icon size={18} />
        </span>
        <p className="min-w-0 flex-1 text-sm text-slate-700">
          <span className="mr-1.5 inline-flex items-center gap-1 font-bold uppercase tracking-wide">
            <Lightbulb size={14} className="inline" />
            Travel tip
          </span>
          {trip.profile.safetyStatus === "advisory"
            ? "Reconsider non-essential travel today. Register with your hotel and keep emergency numbers handy."
            : trip.profile.safetyStatus === "caution"
              ? "Check today's notices, carry ID, and confirm opening hours before heading out."
              : "Pack light layers, keep a local SIM handy, and share your plan with someone at home."}
        </p>
      </div>
    </section>
  );
}
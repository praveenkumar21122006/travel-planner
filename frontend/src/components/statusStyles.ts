import { ShieldAlert, ShieldCheck, TriangleAlert } from "lucide-react";

import type { SafetyStatus } from "../types/safeJourney";

export const STATUS_META: Record<
  SafetyStatus,
  { label: string; chip: string; card: string; icon: typeof ShieldAlert }
> = {
  safe: {
    label: "Safe to Visit",
    chip: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    card: "bg-emerald-50 ring-emerald-200",
    icon: ShieldCheck,
  },
  caution: {
    label: "Caution Advised",
    chip: "bg-amber-100 text-amber-800 ring-amber-200",
    card: "bg-amber-50 ring-amber-200",
    icon: ShieldAlert,
  },
  advisory: {
    label: "Active Advisories",
    chip: "bg-red-100 text-red-800 ring-red-200",
    card: "bg-red-50 ring-red-200",
    icon: TriangleAlert,
  },
};
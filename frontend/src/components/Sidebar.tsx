import { ArrowRightLeft, Compass, LifeBuoy, LogOut, MapPin, Route } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startLabel = s.toLocaleDateString("en-US", opts);
  const endLabel = e.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
};

export const daysBetween = (start: string, end: string) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
};

const navItems = [
  { to: "/", label: "Upcoming Trips", icon: Route },
  { to: "/?tab=explore", label: "Explore", icon: MapPin },
  { to: "/assistant", label: "Trip Assistant", icon: LifeBuoy },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-100 lg:flex">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 text-white">
          <Compass size={20} />
        </div>
        <div>
          <h1 className="font-bold leading-tight">Travel Planner</h1>
          <p className="text-xs text-slate-400">Plan. Pack. Go.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                to === "/" ? "" : isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
              <ArrowRightLeft size={14} className="text-slate-500" />
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
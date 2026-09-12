import { useMemo, useState } from "react";
import {
  Layers,
  LocateFixed,
  Minus,
  Navigation,
  Plus,
} from "lucide-react";

import type { Attraction, EnRouteStop, PlannedTrip } from "../types/safeJourney";
import { primaryTravelTime } from "../data/safeJourney";

interface MapWidgetProps {
  trip: PlannedTrip;
  selectedId: string | null;
}

interface MapTheme {
  land: string;
  water: string;
  river: string;
  park: string;
  road: string;
  roadMain: string;
  roadWhite: string;
  block: string;
  label: string;
  labelSub: string;
  roadLabel: string;
}

const LIGHT_THEME: MapTheme = {
  land: "#f3f6f8",
  water: "#cfe3f7",
  river: "#a9ceef",
  park: "#d8f0dc",
  road: "#ffffff",
  roadMain: "#d7dee5",
  roadWhite: "#fdfdfd",
  block: "#e7edf2",
  label: "#4b5b6b",
  labelSub: "#7c8ea0",
  roadLabel: "#9aa8b6",
};

const SAT_THEME: MapTheme = {
  land: "#0d2015",
  water: "#0b1520",
  river: "#123045",
  park: "#12301c",
  road: "#16281c",
  roadMain: "#1e3a28",
  roadWhite: "#1b2e21",
  block: "#13261a",
  label: "#cfe3d5",
  labelSub: "#8fae9c",
  roadLabel: "#6f8a79",
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

interface DotPosition {
  x: number;
  y: number;
}

const START = { x: 0.14, y: 0.84 };
const END = { x: 0.72, y: 0.3 };
const CTRL = { x: 0.5, y: 0.94 };

function curvePoint(t: number): DotPosition {
  const { x: sx, y: sy } = START;
  const { x: ex, y: ey } = END;
  const { x: cx, y: cy } = CTRL;
  const u = 1 - t;
  return {
    x: u * u * sx + 2 * u * t * cx + t * t * ex,
    y: u * u * sy + 2 * u * t * cy + t * t * ey,
  };
}

function placeDots(attractions: Attraction[]): DotPosition[] {
  const total = attractions.length;
  return attractions.map((a, i) => {
    const h = hash(a.id);
    const t = total === 1 ? 0.45 : 0.16 + (i / (total - 1)) * 0.68;
    const base = curvePoint(t);
    const jitter = ((h % 100) / 100 - 0.5) * 0.14;
    const jitterY = (((h >> 4) % 100) / 100 - 0.5) * 0.1;
    return {
      x: Math.min(0.86, Math.max(0.1, base.x + jitter)),
      y: Math.min(0.86, Math.max(0.2, base.y + jitterY)),
    };
  });
}

function placeRouteStops(stops: EnRouteStop[], totalKm: number): DotPosition[] {
  return stops.map((s) => {
    const h = hash(s.id);
    const t = Math.max(0.06, Math.min(0.94, 1 - s.distanceFromDestinationKm / totalKm));
    const base = curvePoint(t);
    const jitter = (((h >> 3) % 100) / 100 - 0.5) * 0.12;
    const jitterY = (((h >> 6) % 100) / 100 - 0.5) * 0.1;
    return {
      x: Math.min(0.82, Math.max(0.12, base.x + jitter)),
      y: Math.min(0.82, Math.max(0.2, base.y + jitterY)),
    };
  });
}

const toV = (p: DotPosition, W: number, H: number) => `${(p.x * W).toFixed(1)},${(p.y * H).toFixed(1)}`;

export default function MapWidget({ trip, selectedId }: MapWidgetProps) {
  const [scale, setScale] = useState(1);
  const [satellite, setSatellite] = useState(false);
  const theme = satellite ? SAT_THEME : LIGHT_THEME;

  const dots = useMemo(() => placeDots(trip.profile.attractions), [trip]);

  const routeStops = useMemo(
    () => placeRouteStops(trip.profile.enRoute, trip.route.distanceKm || 400),
    [trip]
  );

  const incrementZoom = (delta: number) =>
    setScale((s) => Math.min(3, Math.max(0.6, +(s + delta).toFixed(2))));

  const routePath = useMemo(() => {
    const W = 800;
    const H = 600;
    const points = [
      toV(START, W, H),
      ...dots.map((d) => toV(d, W, H)),
      toV(END, W, H),
    ].join(" L ");
    return `M ${points}`;
  }, [dots]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Navigation size={18} className="text-sky-600" />
          Route Map
        </h2>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
          Simulation
        </span>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-300 shadow-md">
        <div
          className="absolute inset-0 origin-center transition-transform duration-500 ease-out"
          style={{ transform: `scale(${scale})` }}
        >
          <svg
            viewBox="0 0 800 600"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            {/* Land */}
            <rect width="800" height="600" fill={theme.land} />

            {/* City blocks */}
            {BLOCKS.map((r, i) => (
              <rect
                key={i}
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={theme.block}
                rx="6"
              />
            ))}

            {/* Sea / coast */}
            <path
              d="M560 0 C 520 90, 640 150, 610 240 C 580 330, 700 400, 660 500 C 640 560, 690 590, 680 600 L800 600 L800 0 Z"
              fill={theme.water}
            />
            <path
              d="M560 0 C 520 90, 640 150, 610 240 C 580 330, 700 400, 660 500 C 640 560, 690 590, 680 600"
              fill="none"
              stroke={theme.land}
              strokeWidth="6"
            />

            {/* Lake + river */}
            <ellipse cx="180" cy="120" rx="120" ry="52" fill={theme.water} />
            <path
              d="M300 130 C 360 150, 380 240, 340 330 C 310 400, 360 470, 330 560"
              fill="none"
              stroke={theme.river}
              strokeWidth="22"
              strokeLinecap="round"
            />

            {/* Park */}
            <path
              d="M80 420 C 140 380, 240 400, 260 450 C 280 500, 220 540, 140 550 C 70 550, 50 480, 80 420 Z"
              fill={theme.park}
            />

            {/* Road network */}
            <path
              d="M0 300 C 120 260, 220 330, 340 300 S 560 260, 800 300"
              fill="none"
              stroke={theme.roadMain}
              strokeWidth="16"
              strokeLinecap="round"
            />
            <path
              d="M0 300 C 120 260, 220 330, 340 300 S 560 260, 800 300"
              fill="none"
              stroke={theme.roadWhite}
              strokeWidth="6"
              strokeDasharray="10 14"
              strokeLinecap="round"
            />
            <path
              d="M300 0 C 280 160, 360 260, 320 420 C 290 520, 340 590, 330 600"
              fill="none"
              stroke={theme.roadMain}
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d="M300 0 C 280 160, 360 260, 320 420 C 290 520, 340 590, 330 600"
              fill="none"
              stroke={theme.roadWhite}
              strokeWidth="6"
              strokeDasharray="10 14"
              strokeLinecap="round"
            />
            <path
              d="M120 200 C 200 240, 260 400, 220 520"
              fill="none"
              stroke={theme.road}
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M420 60 C 460 140, 400 220, 460 320"
              fill="none"
              stroke={theme.road}
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Labels */}
            <text
              x="800"
              y="250"
              textAnchor="end"
              fontFamily="Inter, sans-serif"
              fontSize="15"
              fontStyle="italic"
              fill={theme.labelSub}
            >
              {trip.profile.bodyOfWater} →
            </text>
            <text
              x="150"
              y="470"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize="14"
              fontWeight="700"
              fill={theme.labelSub}
            >
              {trip.profile.parkLabel}
            </text>
            <text
              x="430"
              y="480"
              fontFamily="Inter, sans-serif"
              fontSize="11"
              fill={theme.roadLabel}
            >
              {trip.profile.roadLabel}
            </text>

            {/* Route trail */}
            <path
              d={routePath}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />
            <path
              d={routePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="14 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="route-flow"
            />

            {/* Waypoint dots */}
            {trip.profile.attractions.map((a, i) => {
              const d = dots[i];
              const selected = a.id === selectedId;
              return (
                <g key={a.id}>
                  {selected && (
                    <circle
                      cx={d.x * 800}
                      cy={d.y * 600}
                      r="26"
                      fill="#38bdf8"
                      opacity="0.35"
                      className="map-pulse"
                    />
                  )}
                  <circle
                    cx={d.x * 800}
                    cy={d.y * 600}
                    r={selected ? 13 : 9}
                    fill={selected ? "#0284c7" : "#38bdf8"}
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  {selected && (
                    <text
                      x={d.x * 800}
                      y={d.y * 600 - 18}
                      textAnchor="middle"
                      fontFamily="Inter, sans-serif"
                      fontSize="13"
                      fontWeight="700"
                      fill="#0369a1"
                    >
                      {a.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Start & destination pins */}
            <Pin x={START.x * 800} y={START.y * 600} color="#059669" label={trip.origin} />
            <Pin x={END.x * 800} y={END.y * 600} color="#e11d48" label={trip.destination} />

            {/* En-route tourist stops */}
            {trip.profile.enRoute.map((s, i) => {
              const d = routeStops[i];
              return (
                <g key={s.id}>
                  <circle
                    cx={d.x * 800}
                    cy={d.y * 600}
                    r="7"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="3"
                  />
                  <circle cx={d.x * 800} cy={d.y * 600} r="2.5" fill="#ffffff" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Top-left legend */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow backdrop-blur-sm">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Start
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> {trip.destination}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Spots
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> On route
          </span>
        </div>

        {/* Map controls */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
          <MapButton
            label="Zoom in"
            onClick={() => incrementZoom(0.35)}
          >
            <Plus size={16} />
          </MapButton>
          <MapButton label="Zoom out" onClick={() => incrementZoom(-0.35)} disabled={scale <= 0.6}>
            <Minus size={16} />
          </MapButton>
          <MapButton
            label={satellite ? "Switch to map view" : "Toggle satellite view"}
            onClick={() => setSatellite((s) => !s)}
            active={satellite}
          >
            <Layers size={16} />
          </MapButton>
          <MapButton
            label="Center route"
            onClick={() => setScale(1)}
            disabled={Math.abs(scale - 1) < 0.01}
          >
            <LocateFixed size={16} />
          </MapButton>
        </div>

        {/* Bottom-left scale + compass */}
        <div className="absolute bottom-2.5 left-2.5 flex items-end gap-3 rounded-xl bg-white/90 px-3 py-2 shadow backdrop-blur-sm">
          <svg width="52" height="6" aria-hidden="true">
            <rect x="0" y="2" width="40" height="2" fill="#334155" />
            <path d="M0 2 L4 0 L4 4 Z" fill="#334155" />
            <path d="M40 2 L44 0 L44 4 Z" fill="#334155" />
          </svg>
          <span className="text-[10px] font-semibold text-slate-600">
            {(20 / scale).toFixed(1)} km
          </span>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 L14 12 L12 22 L10 12 Z" fill="#e11d48" opacity="0.85" />
            <path d="M12 2 L14 12 L10 12 Z" fill="#fecaca" />
          </svg>
        </div>

        {/* Zoom readout */}
        <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow backdrop-blur-sm">
          {satellite ? "Satellite" : "Map"} · {Math.round(scale * 100)}%
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <Navigation size={13} />
        {trip.route.distanceKm} km · {primaryTravelTime(trip.route).replace(" by Car", "")} travel
        estimate. Mock widget — connect a mapping provider for live tiles.
      </p>
    </section>
  );
}

function MapButton({
  label,
  onClick,
  children,
  active = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-xl bg-white shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-40 ${
        active ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Pin({
  x,
  y,
  color,
  label,
}: {
  x: number;
  y: number;
  color: string;
  label: string;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="26" fill={color} opacity="0.22" className="map-pulse" />
      <path d="M0 -20 L6 -8 L0 -11 L-6 -8 Z" fill={color} />
      <circle r="8" fill={color} stroke="#ffffff" strokeWidth="3" />
      <text
        y={-32}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="#0f172a"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      >
        {label}
      </text>
      <text
        y={-32}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}

const BLOCKS: { x: number; y: number; w: number; h: number }[] = [
  { x: 40, y: 220, w: 60, h: 40 },
  { x: 120, y: 250, w: 80, h: 45 },
  { x: 340, y: 320, w: 70, h: 40 },
  { x: 430, y: 360, w: 90, h: 45 },
  { x: 250, y: 430, w: 60, h: 36 },
  { x: 70, y: 130, w: 50, h: 32 },
  { x: 250, y: 170, w: 70, h: 38 },
  { x: 470, y: 220, w: 60, h: 34 },
];
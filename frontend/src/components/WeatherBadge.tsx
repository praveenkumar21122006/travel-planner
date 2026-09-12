import { useEffect, useState } from "react";
import { CloudSun, Loader2, MapPin } from "lucide-react";

import type { ForecastResponse } from "../types";
import { api } from "../services/api";

interface WeatherBadgeProps {
  city: string;
  country?: string;
  compact?: boolean;
}

export default function WeatherBadge({ city, country, compact = false }: WeatherBadgeProps) {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    setForecast(null);

    api
      .getForecast(city, country, 5)
      .then((res) => {
        if (!cancelled) {
          setForecast(res);
          setState("ok");
        }
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [city, country]);

  if (state === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
        <Loader2 size={12} className="animate-spin" />
        Weather…
      </span>
    );
  }

  if (state === "error" || !forecast || forecast.days.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
        <CloudSun size={12} />
        Weather unavailable
      </span>
    );
  }

  const today = forecast.days[0];

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800" title={today.description}>
        <img
          src={`https://openweathermap.org/img/wn/${today.icon}.png`}
          alt={today.description}
          className="h-5 w-5"
        />
        {Math.round(forecast.days[1]?.maxTemp ?? today.maxTemp)}°C
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        <CloudSun size={14} />
        5-Day Forecast
      </div>
      <div className="flex items-center gap-4">
        {forecast.days.slice(0, 5).map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1 text-center">
            <span className="text-[11px] font-medium text-slate-500">
              {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <img
              src={`https://openweathermap.org/img/wn/${day.icon}.png`}
              alt={day.description}
              className="h-8 w-8"
            />
            <span className="text-sm font-semibold">{Math.round(day.maxTemp)}°</span>
            <span className="text-[11px] text-slate-400">{Math.round(day.minTemp)}°</span>
          </div>
        ))}
      </div>
      <p className="mt-3 truncate text-xs capitalize text-slate-500">
        <MapPin size={11} className="mr-1 inline" />
        {forecast.city} · {forecast.days[0].description}
      </p>
    </div>
  );
}
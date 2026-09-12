import type { ForecastResponse, WeatherDay } from "../types/weather";
import { HttpError } from "../middleware/error";

export async function fetchWeatherForecast(params: {
  city: string;
  country?: string;
  days: number;
}): Promise<ForecastResponse> {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    throw new HttpError(503, "OpenWeatherMap API key is not configured (OPENWEATHER_API_KEY)");
  }

  const query = params.country ? `${params.city},${params.country}` : params.city;
  const url =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    encodeURIComponent(query) +
    `&appid=${encodeURIComponent(key)}&units=metric&cnt=${params.days * 8}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new HttpError(res.status, `OpenWeatherMap request failed: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    city: { name: string; country: string; coord: { lat: number; lon: number } };
    list: Array<{
      dt: number;
      dt_txt: string;
      main: { temp: number; feels_like: number; humidity: number };
      weather: Array<{ main: string; description: string; icon: string }>;
      wind: { speed: number };
    }>;
  };

  const dayMap = new Map<string, WeatherDay>();

  for (const item of data.list) {
    const date = item.dt_txt.slice(0, 10);
    const existing = dayMap.get(date);
    if (!existing) {
      dayMap.set(date, {
        date,
        minTemp: item.main.temp,
        maxTemp: item.main.temp,
        avgTemp: item.main.temp,
        description: item.weather[0]?.description ?? "n/a",
        icon: item.weather[0]?.icon ?? "01d",
        humidity: item.main.humidity,
        windSpeed: item.wind.speed,
      });
      continue;
    }

    existing.minTemp = Math.min(existing.minTemp, item.main.temp);
    existing.maxTemp = Math.max(existing.maxTemp, item.main.temp);
    const count = existing.readings ?? 1;
    existing.avgTemp =
      (existing.avgTemp * count + item.main.temp) / (count + 1);
    existing.readings = count + 1;
    if (existing.humidity < item.main.humidity) existing.humidity = item.main.humidity;
    if (existing.windSpeed < item.wind.speed) existing.windSpeed = item.wind.speed;
  }

  return {
    city: data.city.name,
    country: data.city.country,
    unit: "metric",
    days: [...dayMap.values()].slice(0, params.days).map(({ readings, ...rest }) => rest),
  };
}


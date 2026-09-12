import type { CitySearchResponse, CitySuggestion } from "../types/weather";
import { HttpError } from "../middleware/error";

const EMBEDDED_CITIES: CitySuggestion[] = [
  { name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
  { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006 },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  { name: "Rome", country: "Italy", latitude: 41.9028, longitude: 12.4964 },
  { name: "Barcelona", country: "Spain", latitude: 41.3874, longitude: 2.1686 },
  { name: "Amsterdam", country: "Netherlands", latitude: 52.3676, longitude: 4.9041 },
  { name: "Bangkok", country: "Thailand", latitude: 13.7563, longitude: 100.5018 },
  { name: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708 },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
  { name: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { name: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405 },
  { name: "Istanbul", country: "Turkey", latitude: 41.0082, longitude: 28.9784 },
  { name: "Lisbon", country: "Portugal", latitude: 38.7223, longitude: -9.1393 },
  { name: "Prague", country: "Czech Republic", latitude: 50.0755, longitude: 14.4378 },
  { name: "Marrakech", country: "Morocco", latitude: 31.6295, longitude: -7.9811 },
  { name: "Copenhagen", country: "Denmark", latitude: 55.6761, longitude: 12.5683 },
  { name: "Vancouver", country: "Canada", latitude: 49.2827, longitude: -123.1207 },
  { name: "Mexico City", country: "Mexico", latitude: 19.4326, longitude: -99.1332 },
  { name: "Rio de Janeiro", country: "Brazil", latitude: -22.9068, longitude: -43.1729 },
  { name: "Buenos Aires", country: "Argentina", latitude: -34.6037, longitude: -58.3816 },
  { name: "Cape Town", country: "South Africa", latitude: -33.9249, longitude: 18.4241 },
  { name: "Seoul", country: "South Korea", latitude: 37.5665, longitude: 126.978 },
  { name: "Vienna", country: "Austria", latitude: 48.2082, longitude: 16.3738 },
];

const EMBEDDED_PROVIDER = "embedded";

let amadeusToken: { value: string; expiresAt: number } | null = null;

export async function searchCities(
  query: string,
  max: number
): Promise<CitySearchResponse> {
  const hasAmadeus = Boolean(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
  const hasGeoNames = Boolean(process.env.GEONAMES_USERNAME);

  if (hasAmadeus) {
    try {
      return await searchAmadeus(query, max);
    } catch (err) {
      console.warn("[cities] Amadeus failed, falling back.", (err as Error).message);
    }
  }

  if (hasGeoNames) {
    try {
      const result = await searchGeoNames(query, max);
      if (result.suggestions.length > 0) return result;
    } catch (err) {
      console.warn("[cities] GeoNames failed, falling back.", (err as Error).message);
    }
  }

  return searchEmbedded(query, max);
}

async function getAmadeusToken(): Promise<string> {
  if (amadeusToken && amadeusToken.expiresAt > Date.now()) {
    return amadeusToken.value;
  }

  const key = process.env.AMADEUS_API_KEY!;
  const secret = process.env.AMADEUS_API_SECRET!;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: key,
    client_secret: secret,
  });

  const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new HttpError(res.status, `Amadeus token request failed: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  amadeusToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return amadeusToken.value;
}

async function searchAmadeus(query: string, max: number): Promise<CitySearchResponse> {
  const token = await getAmadeusToken();
  const url =
    "https://test.api.amadeus.com/v1/reference-data/locations?" +
    new URLSearchParams({ subType: "CITY,AIRPORT", keyword: query, "page[limit]": String(max) });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new HttpError(res.status, `Amadeus location search failed: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    data?: Array<{
      name?: string;
      countryCode?: string;
      geoCode?: { latitude?: number; longitude?: number };
      address?: { countryName?: string };
    }>;
  };

  const suggestions: CitySuggestion[] = (data.data ?? [])
    .filter((item) => item?.name && item?.geoCode)
    .map((item) => ({
      name: item.name!,
      country: item.address?.countryName ?? item.countryCode ?? "",
      latitude: item.geoCode!.latitude!,
      longitude: item.geoCode!.longitude!,
    }))
    .filter((s) => s.country)
    .slice(0, max);

  return { suggestions, provider: "amadeus" };
}

async function searchGeoNames(query: string, max: number): Promise<CitySearchResponse> {
  const username = process.env.GEONAMES_USERNAME!;
  const url =
    "http://api.geonames.org/searchJSON?" +
    new URLSearchParams({
      name_startsWith: query,
      featureClass: "P",
      maxRows: String(max),
      username,
    });

  const res = await fetch(url);
  if (!res.ok) {
    throw new HttpError(res.status, "GeoNames request failed");
  }

  const data = (await res.json()) as {
    geonames?: Array<{
      name: string;
      countryName: string;
      lat: string;
      lng: string;
    }>;
  };

  const suggestions: CitySuggestion[] = (data.geonames ?? [])
    .map((item) => ({
      name: item.name,
      country: item.countryName,
      latitude: Number(item.lat),
      longitude: Number(item.lng),
    }))
    .filter((s) => s.country)
    .slice(0, max);

  return { suggestions, provider: "geonames" };
}

function searchEmbedded(query: string, max: number): CitySearchResponse {
  const q = query.trim().toLowerCase();
  const suggestions = EMBEDDED_CITIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  ).slice(0, max);

  return { suggestions, provider: EMBEDDED_PROVIDER };
}
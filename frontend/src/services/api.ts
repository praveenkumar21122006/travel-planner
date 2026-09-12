import type {
  Activity,
  ActivityDraft,
  AuthResponse,
  CitySearchResponse,
  ForecastResponse,
  Trip,
  TripDraft,
} from "../types";

const TOKEN_KEY = "travel_planner_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // empty body
  }

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `Request failed with status ${res.status}`;
    throw new ApiError(
      res.status,
      message,
      payload && typeof payload === "object" && "details" in payload ? payload : undefined
    );
  }

  return payload as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  validateToken: () => request<{ valid: boolean; user: { id: string; email: string } }>("/auth/validate"),

  getTrips: () => request<Trip[]>("/trips"),

  getTrip: (id: string) => request<Trip>(`/trips/${id}`),

  createTrip: (draft: TripDraft) =>
    request<Trip>("/trips", { method: "POST", body: JSON.stringify(draft) }),

  updateTrip: (id: string, patch: Partial<TripDraft>) =>
    request<Trip>(`/trips/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  deleteTrip: (id: string) => request<void>(`/trips/${id}`, { method: "DELETE" }),

  getActivities: (tripId: string) => request<Activity[]>(`/trips/${tripId}/activities`),

  createActivity: (tripId: string, draft: ActivityDraft) =>
    request<Activity>(`/trips/${tripId}/activities`, {
      method: "POST",
      body: JSON.stringify(draft),
    }),

  updateActivity: (tripId: string, activityId: string, patch: Partial<ActivityDraft>) =>
    request<Activity>(`/trips/${tripId}/activities/${activityId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteActivity: (tripId: string, activityId: string) =>
    request<void>(`/trips/${tripId}/activities/${activityId}`, { method: "DELETE" }),

  getForecast: (city: string, country?: string, days = 5) => {
    const params = new URLSearchParams({ city, days: String(days) });
    if (country) params.set("country", country);
    return request<ForecastResponse>(`/weather/forecast?${params.toString()}`);
  },

  autocompleteCities: (query: string, max = 10) =>
    request<CitySearchResponse>(
      `/cities/autocomplete?${new URLSearchParams({ q: query, max: String(max) })}`
    ),
};